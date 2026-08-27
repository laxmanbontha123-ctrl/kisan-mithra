import cors from "cors";
import express, {Request, Response} from "express";
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {onRequest} from "firebase-functions/v2/https";
import {registerDiseaseHistoryRoutes} from "./disease-history";
import {registerWeatherRoutes} from "./weather";
import {registerCropRoutes} from "./crops";
import {registerAgriResourceRoutes} from "./agri-resources";
import {registerProfileManagementRoutes} from "./profile-management";
import {
  registerEmailAuthRoutes,
  smtpPass,
  smtpUser,
} from "./email-auth";

initializeApp();

const app = express();
const firestore = getFirestore();
const adminAuth = getAuth();

app.use(cors({origin: true}));
app.use(express.json({limit: "1mb"}));

/**
 * Normalizes a farmer name submitted by the client.
 *
 * @param {unknown} value Raw farmer name.
 * @return {string} Normalized farmer name.
 */
function normalizeFullName(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

app.get("/health", (_request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: "Kisan Mithra Firebase backend is healthy.",
  });
});

registerEmailAuthRoutes(app, firestore, adminAuth);
registerDiseaseHistoryRoutes(app, firestore, adminAuth);
registerWeatherRoutes(app, adminAuth);
registerCropRoutes(app, firestore, adminAuth);
registerAgriResourceRoutes(app, adminAuth);
registerProfileManagementRoutes(app, firestore, adminAuth);

app.post(
  "/api/auth/firebase/phone-login",
  async (request: Request, response: Response): Promise<void> => {
    const {idToken, fullName: rawFullName} = request.body ?? {};
    const fullName = normalizeFullName(rawFullName);

    if (typeof idToken !== "string" || !idToken.trim()) {
      response.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
      return;
    }

    if (fullName.length < 2 || fullName.length > 80) {
      response.status(400).json({
        success: false,
        message: "Farmer full name must contain 2 to 80 characters.",
      });
      return;
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const firebasePhone = decodedToken.phone_number;

      if (typeof firebasePhone !== "string" || !firebasePhone) {
        response.status(401).json({
          success: false,
          message: "Verified phone number was not found in Firebase token.",
        });
        return;
      }

      const phoneDigits = firebasePhone.replace(/\D/g, "");
      const phone =
        phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits;

      const userReference = firestore
        .collection("users")
        .doc(decodedToken.uid);

      const existingSnapshot = await userReference.get();
      const existingData = existingSnapshot.data();

      const role =
        typeof existingData?.role === "string" ?
          existingData.role :
          "farmer";

      const language =
        typeof existingData?.language === "string" ?
          existingData.language :
          "en";

      const nowIso = new Date().toISOString();

      const profileData: Record<string, unknown> = {
        uid: decodedToken.uid,
        fullName,
        email: decodedToken.email ?? existingData?.email ?? null,
        phone,
        role,
        language,
        phoneVerified: true,
        emailVerified: existingData?.emailVerified === true,
        authProvider: "phone",
        lastLoginAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (!existingSnapshot.exists) {
        profileData.createdAt = FieldValue.serverTimestamp();
      }

      await userReference.set(profileData, {merge: true});

      await adminAuth.updateUser(decodedToken.uid, {
        displayName: fullName,
      });

      response.status(200).json({
        success: true,
        message: existingSnapshot.exists ?
          "Firebase phone login successful." :
          "Farmer account created successfully.",
        token: idToken,
        user: {
          id: decodedToken.uid,
          fullName,
          email: decodedToken.email ?? existingData?.email ?? null,
          phone,
          role,
          language,
          emailVerified: existingData?.emailVerified === true,
          phoneVerified: true,
          lastLoginAt: nowIso,
        },
      });
    } catch (error) {
      logger.error("Firebase phone login failed.", error);

      response.status(401).json({
        success: false,
        message: "Phone authentication failed. Please login again.",
      });
    }
  },
);

app.get(
  "/api/auth/profile",
  async (request: Request, response: Response): Promise<void> => {
    const authorization = request.headers.authorization;

    if (
      typeof authorization !== "string" ||
      !authorization.startsWith("Bearer ")
    ) {
      response.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const idToken = authorization.slice(7).trim();

    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const userSnapshot = await firestore
        .collection("users")
        .doc(decodedToken.uid)
        .get();

      if (!userSnapshot.exists) {
        response.status(404).json({
          success: false,
          message: "Farmer profile was not found.",
        });
        return;
      }

      const userData = userSnapshot.data() ?? {};

      response.status(200).json({
        success: true,
        message: "Farmer profile fetched successfully.",
        user: {
          id: decodedToken.uid,
          fullName: userData.fullName ?? decodedToken.name ?? "Farmer",
          email: userData.email ?? decodedToken.email ?? null,
          phone: userData.phone ?? null,
          role: userData.role ?? "farmer",
          language: userData.language ?? "en",
          emailVerified: userData.emailVerified === true,
          phoneVerified: userData.phoneVerified === true,
        },
      });
    } catch (error) {
      logger.error("Fetching farmer profile failed.", error);

      response.status(401).json({
        success: false,
        message: "Authentication expired. Please login again.",
      });
    }
  },
);
app.use((_request: Request, response: Response) => {
  response.status(404).json({
    success: false,
    message: "Firebase API route was not found.",
  });
});

export const backend = onRequest(
  {
    region: "asia-south1",
    maxInstances: 10,
    timeoutSeconds: 60,
    secrets: [smtpUser, smtpPass],
  },
  app,
);
