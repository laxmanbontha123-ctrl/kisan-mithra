import {createHash, randomInt, timingSafeEqual} from "node:crypto";

import express, {Request, Response} from "express";
import {Auth, UserRecord} from "firebase-admin/auth";
import {FieldValue, Firestore, Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {defineSecret} from "firebase-functions/params";
import nodemailer from "nodemailer";

export const smtpUser = defineSecret("SMTP_USER");
export const smtpPass = defineSecret("SMTP_PASS");

/**
 * Normalizes an email address.
 *
 * @param {unknown} value Raw email value.
 * @return {string} Normalized email address.
 */
function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Normalizes a farmer full name.
 *
 * @param {unknown} value Raw name value.
 * @return {string} Normalized farmer name.
 */
function normalizeFullName(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

/**
 * Produces a non-identifying Firestore document id for an email.
 *
 * @param {string} email Normalized email address.
 * @return {string} SHA-256 document id.
 */
function emailOtpDocumentId(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

/**
 * Hashes an OTP with the SMTP secret as a server-side pepper.
 *
 * @param {string} email Normalized email address.
 * @param {string} code Six-digit OTP.
 * @return {string} SHA-256 OTP hash.
 */
function hashOtp(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email}:${code}:${smtpPass.value()}`)
    .digest("hex");
}

/**
 * Reads a Firebase error code without trusting the thrown value.
 *
 * @param {unknown} error Unknown caught error.
 * @return {string} Firebase error code when present.
 */
function getErrorCode(error: unknown): string {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return "";
  }

  const code = (error as {code?: unknown}).code;
  return typeof code === "string" ? code : "";
}

/**
 * Registers secure email OTP authentication routes.
 *
 * @param {express.Express} app Express application.
 * @param {Firestore} firestore Firestore Admin client.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerEmailAuthRoutes(
  app: express.Express,
  firestore: Firestore,
  adminAuth: Auth,
): void {
  app.post(
    "/api/auth/email/request-otp",
    async (request: Request, response: Response): Promise<void> => {
      const email = normalizeEmail(request.body?.email);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        response.status(400).json({
          success: false,
          message: "Enter a valid email address.",
        });
        return;
      }

      const otpReference = firestore
        .collection("emailOtps")
        .doc(emailOtpDocumentId(email));

      try {
        const existingSnapshot = await otpReference.get();
        const requestedAt = existingSnapshot.data()?.requestedAt;

        if (
          requestedAt instanceof Timestamp &&
          Date.now() - requestedAt.toMillis() < 60000
        ) {
          response.status(429).json({
            success: false,
            message: "Please wait one minute before requesting another OTP.",
          });
          return;
        }

        const otp = randomInt(100000, 1000000).toString();

        await otpReference.set({
          email,
          otpHash: hashOtp(email, otp),
          attempts: 0,
          consumed: false,
          requestedAt: FieldValue.serverTimestamp(),
          expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
        });

        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: smtpUser.value(),
              pass: smtpPass.value(),
            },
          });

          await transporter.sendMail({
            from: `"Kisan Mithra" <${smtpUser.value()}>`,
            to: email,
            subject: "Your Kisan Mithra login OTP",
            text:
              `Your Kisan Mithra OTP is ${otp}. ` +
              "It is valid for 10 minutes.",
            html: `
              <div style="font-family:Arial,sans-serif;max-width:520px;
                margin:auto;padding:24px;border:1px solid #a7f3d0;
                border-radius:18px">
                <h2 style="color:#047857">Kisan Mithra Login</h2>
                <p>Hello Farmer,</p>
                <p>Use this OTP to securely login to Kisan Mithra:</p>
                <div style="font-size:32px;font-weight:bold;
                  letter-spacing:8px;text-align:center;color:#064e3b;
                  background:#ecfdf5;padding:18px;border-radius:12px">
                  ${otp}
                </div>
                <p>This OTP is valid for 10 minutes. Do not share it.</p>
              </div>
            `,
          });
        } catch (emailError) {
          await otpReference.delete();
          throw emailError;
        }

        response.status(200).json({
          success: true,
          message: "Email OTP sent successfully.",
        });
      } catch (error) {
        logger.error("Sending email OTP failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to send email OTP. Please try again.",
        });
      }
    },
  );

  app.post(
    "/api/auth/email/verify-otp",
    async (request: Request, response: Response): Promise<void> => {
      const email = normalizeEmail(request.body?.email);
      const fullName = normalizeFullName(request.body?.fullName);
      const rawCode = request.body?.code;
      const code =
        typeof rawCode === "string" ? rawCode.replace(/\D/g, "") : "";

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        code.length !== 6 ||
        fullName.length < 2 ||
        fullName.length > 80
      ) {
        response.status(400).json({
          success: false,
          message: "Valid name, email, and 6-digit OTP are required.",
        });
        return;
      }

      const otpReference = firestore
        .collection("emailOtps")
        .doc(emailOtpDocumentId(email));

      try {
        const otpSnapshot = await otpReference.get();
        const otpData = otpSnapshot.data();

        if (!otpSnapshot.exists || !otpData) {
          response.status(400).json({
            success: false,
            message: "OTP was not found. Request a new OTP.",
          });
          return;
        }

        const expiresAt = otpData.expiresAt;
        const attempts =
          typeof otpData.attempts === "number" ? otpData.attempts : 0;

        if (
          !(expiresAt instanceof Timestamp) ||
          expiresAt.toMillis() <= Date.now()
        ) {
          await otpReference.delete();
          response.status(400).json({
            success: false,
            message: "OTP expired. Request a new OTP.",
          });
          return;
        }

        if (attempts >= 5) {
          await otpReference.delete();
          response.status(429).json({
            success: false,
            message: "Too many attempts. Request a new OTP.",
          });
          return;
        }

        const suppliedHash = hashOtp(email, code);
        const storedHash =
          typeof otpData.otpHash === "string" ? otpData.otpHash : "";
        const isValidHash =
          /^[a-f0-9]{64}$/.test(storedHash) &&
          timingSafeEqual(
            Buffer.from(suppliedHash, "hex"),
            Buffer.from(storedHash, "hex"),
          );

        if (!isValidHash) {
          await otpReference.update({attempts: FieldValue.increment(1)});
          response.status(400).json({
            success: false,
            message: "Invalid OTP. Please check and try again.",
          });
          return;
        }

        let firebaseUser: UserRecord;

        try {
          firebaseUser = await adminAuth.getUserByEmail(email);
          firebaseUser = await adminAuth.updateUser(firebaseUser.uid, {
            displayName: fullName,
            emailVerified: true,
          });
        } catch (authError) {
          if (getErrorCode(authError) !== "auth/user-not-found") {
            throw authError;
          }

          firebaseUser = await adminAuth.createUser({
            email,
            displayName: fullName,
            emailVerified: true,
          });
        }

        const userReference = firestore
          .collection("users")
          .doc(firebaseUser.uid);
        const existingSnapshot = await userReference.get();
        const existingData = existingSnapshot.data();
        const nowIso = new Date().toISOString();
        const profileData: Record<string, unknown> = {
          uid: firebaseUser.uid,
          fullName,
          email,
          phone: existingData?.phone ?? null,
          role: existingData?.role ?? "farmer",
          language: existingData?.language ?? "en",
          emailVerified: true,
          phoneVerified: existingData?.phoneVerified === true,
          authProvider: "email",
          lastLoginAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (!existingSnapshot.exists) {
          profileData.createdAt = FieldValue.serverTimestamp();
        }

        await userReference.set(profileData, {merge: true});
        await otpReference.delete();

        const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

        response.status(200).json({
          success: true,
          message: existingSnapshot.exists ?
            "Email OTP login successful." :
            "Farmer account created successfully.",
          token: customToken,
          user: {
            id: firebaseUser.uid,
            fullName,
            email,
            phone: existingData?.phone ?? null,
            role: existingData?.role ?? "farmer",
            language: existingData?.language ?? "en",
            emailVerified: true,
            phoneVerified: existingData?.phoneVerified === true,
            lastLoginAt: nowIso,
          },
        });
      } catch (error) {
        logger.error("Verifying email OTP failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to verify email OTP. Please try again.",
        });
      }
    },
  );
}
