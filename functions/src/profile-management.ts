import express, {Request, Response} from "express";
import {Auth, DecodedIdToken} from "firebase-admin/auth";
import {
  FieldValue,
  Firestore,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

/**
 * Normalizes a farmer name.
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

/**
 * Verifies a Firebase bearer token.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {Promise<DecodedIdToken|null>} Verified token or null.
 */
async function authenticateRequest(
  request: Request,
  response: Response,
  adminAuth: Auth,
): Promise<DecodedIdToken | null> {
  const authorization = request.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    response.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(
      authorization.slice(7).trim(),
    );
  } catch {
    response.status(401).json({
      success: false,
      message: "Authentication expired. Please login again.",
    });
    return null;
  }
}

/**
 * Deletes all documents owned by one farmer from a collection.
 *
 * @param {Firestore} firestore Firestore Admin client.
 * @param {string} collectionName Collection to clean.
 * @param {string} userId Farmer Firebase uid.
 * @return {Promise<number>} Number of deleted documents.
 */
async function deleteOwnedDocuments(
  firestore: Firestore,
  collectionName: string,
  userId: string,
): Promise<number> {
  let deletedCount = 0;
  let snapshot = await firestore
    .collection(collectionName)
    .where("userId", "==", userId)
    .limit(400)
    .get();

  while (!snapshot.empty) {
    const batch = firestore.batch();

    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    await batch.commit();
    deletedCount += snapshot.size;

    snapshot = await firestore
      .collection(collectionName)
      .where("userId", "==", userId)
      .limit(400)
      .get();
  }

  return deletedCount;
}

/**
 * Registers farmer profile update and account deletion routes.
 *
 * @param {express.Express} app Express application.
 * @param {Firestore} firestore Firestore Admin client.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerProfileManagementRoutes(
  app: express.Express,
  firestore: Firestore,
  adminAuth: Auth,
): void {
  app.patch(
    "/api/auth/profile",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );

      if (!decodedToken) {
        return;
      }

      const fullName = normalizeFullName(request.body?.fullName);
      const language =
        typeof request.body?.language === "string" ?
          request.body.language.trim().toLowerCase() :
          "";

      if (fullName.length < 2 || fullName.length > 80) {
        response.status(400).json({
          success: false,
          message: "Farmer full name must contain 2 to 80 characters.",
        });
        return;
      }

      if (!["en", "te"].includes(language)) {
        response.status(400).json({
          success: false,
          message: "Preferred language must be English or Telugu.",
        });
        return;
      }

      const userReference = firestore
        .collection("users")
        .doc(decodedToken.uid);

      try {
        const userSnapshot = await userReference.get();

        if (!userSnapshot.exists) {
          response.status(404).json({
            success: false,
            message: "Farmer profile was not found.",
          });
          return;
        }

        await adminAuth.updateUser(decodedToken.uid, {
          displayName: fullName,
        });

        await userReference.update({
          fullName,
          language,
          updatedAt: FieldValue.serverTimestamp(),
        });

        const userData = userSnapshot.data() ?? {};

        response.status(200).json({
          success: true,
          message: "Farmer profile updated successfully.",
          user: {
            id: decodedToken.uid,
            fullName,
            email: userData.email ?? decodedToken.email ?? null,
            phone: userData.phone ?? null,
            role: userData.role ?? "farmer",
            language,
            emailVerified: userData.emailVerified === true,
            phoneVerified: userData.phoneVerified === true,
          },
        });
      } catch (error) {
        logger.error("Updating farmer profile failed.", {
          userId: decodedToken.uid,
          error,
        });

        response.status(500).json({
          success: false,
          message: "Unable to update farmer profile right now.",
        });
      }
    },
  );

  app.delete(
    "/api/auth/account",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );

      if (!decodedToken) {
        return;
      }

      const authenticatedAt = decodedToken.auth_time;
      const authenticationAge =
        Math.floor(Date.now() / 1000) - authenticatedAt;

      if (
        !Number.isFinite(authenticatedAt) ||
        authenticationAge > 10 * 60
      ) {
        response.status(403).json({
          success: false,
          message:
            "For security, sign in again before deleting your account.",
        });
        return;
      }
      if (request.body?.confirmation !== "DELETE") {
        response.status(400).json({
          success: false,
          message: "Type DELETE to confirm permanent account deletion.",
        });
        return;
      }

      try {
        await adminAuth.revokeRefreshTokens(decodedToken.uid);

        const [deletedCrops, deletedScans] = await Promise.all([
          deleteOwnedDocuments(
            firestore,
            "crops",
            decodedToken.uid,
          ),
          deleteOwnedDocuments(
            firestore,
            "diseaseScans",
            decodedToken.uid,
          ),
        ]);

        await firestore
          .collection("users")
          .doc(decodedToken.uid)
          .delete();

        await adminAuth.deleteUser(decodedToken.uid);

        response.status(200).json({
          success: true,
          message: "Farmer account and saved data deleted permanently.",
          deletedRecords: {
            crops: deletedCrops,
            diseaseScans: deletedScans,
          },
        });
      } catch (error) {
        logger.error("Deleting farmer account failed.", {
          userId: decodedToken.uid,
          error,
        });

        response.status(500).json({
          success: false,
          message:
            "Account deletion could not be completed. Please try again.",
        });
      }
    },
  );
}
