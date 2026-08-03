import express, {Request, Response} from "express";
import {Auth, DecodedIdToken} from "firebase-admin/auth";
import {Firestore, Timestamp} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

/**
 * Returns a bearer token from an Authorization header.
 *
 * @param {Request} request Express request.
 * @return {string} Firebase ID token or an empty string.
 */
function getBearerToken(request: Request): string {
  const authorization = request.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return "";
  }

  return authorization.slice(7).trim();
}

/**
 * Verifies a Firebase ID token for a protected request.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {Promise<DecodedIdToken|null>} Decoded token when valid.
 */
async function authenticateRequest(
  request: Request,
  response: Response,
  adminAuth: Auth,
): Promise<DecodedIdToken | null> {
  const idToken = getBearerToken(request);

  if (!idToken) {
    response.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    logger.warn("Disease history authentication failed.", error);
    response.status(401).json({
      success: false,
      message: "Authentication expired. Please login again.",
    });
    return null;
  }
}

/**
 * Converts a Firestore timestamp or stored date to ISO text.
 *
 * @param {unknown} value Stored timestamp value.
 * @return {string} ISO date string.
 */
function toIsoDate(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }

  return new Date(0).toISOString();
}

/**
 * Returns a nullable string from unknown Firestore data.
 *
 * @param {unknown} value Stored value.
 * @return {string|null} String or null.
 */
function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/**
 * Registers authenticated Disease History routes.
 *
 * @param {express.Express} app Express application.
 * @param {Firestore} firestore Firestore Admin client.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerDiseaseHistoryRoutes(
  app: express.Express,
  firestore: Firestore,
  adminAuth: Auth,
): void {
  app.get(
    "/api/disease/history",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );

      if (!decodedToken) {
        return;
      }

      try {
        const snapshot = await firestore
          .collection("diseaseScans")
          .where("userId", "==", decodedToken.uid)
          .get();

        const scans = snapshot.docs
          .map((document) => {
            const data = document.data();

            return {
              id: document.id,
              prediction:
                typeof data.prediction === "string" ?
                  data.prediction :
                  "Unknown",
              confidence:
                typeof data.confidence === "number" ? data.confidence : 0,
              crop: nullableString(data.crop),
              disease: nullableString(data.disease),
              severity: nullableString(data.severity),
              summary: nullableString(data.summary),
              imageUrl: nullableString(data.imageUrl),
              createdAt: toIsoDate(data.createdAt),
            };
          })
          .sort(
            (left, right) =>
              Date.parse(right.createdAt) - Date.parse(left.createdAt),
          )
          .slice(0, 100);

        response.status(200).json({
          success: true,
          scans,
          message:
            scans.length > 0 ?
              "Disease scan history fetched successfully." :
              "No saved disease scans yet.",
        });
      } catch (error) {
        logger.error("Fetching disease history failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to fetch disease scan history.",
        });
      }
    },
  );

  app.delete(
    "/api/disease/history/:scanId",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );

      if (!decodedToken) {
        return;
      }

      const scanId = String(request.params.scanId ?? "").trim();

      if (!scanId) {
        response.status(400).json({
          success: false,
          message: "Disease scan id is required.",
        });
        return;
      }

      try {
        const scanReference = firestore.collection("diseaseScans").doc(scanId);
        const scanSnapshot = await scanReference.get();

        if (!scanSnapshot.exists) {
          response.status(404).json({
            success: false,
            message: "Disease scan was not found.",
          });
          return;
        }

        if (scanSnapshot.data()?.userId !== decodedToken.uid) {
          response.status(403).json({
            success: false,
            message: "You cannot delete this disease scan.",
          });
          return;
        }

        await scanReference.delete();

        response.status(200).json({
          success: true,
          message: "Disease scan deleted successfully.",
        });
      } catch (error) {
        logger.error("Deleting disease history failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to delete disease scan.",
        });
      }
    },
  );
}
