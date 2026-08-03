import express, {Request, Response} from "express";
import {Auth, DecodedIdToken} from "firebase-admin/auth";
import {
  DocumentSnapshot,
  Firestore,
  Timestamp,
} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

/**
 * Returns the Firebase bearer token from a request.
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
 * Verifies a protected Crop API request.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {Promise<DecodedIdToken|null>} Decoded Firebase token.
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
    logger.warn("Crop authentication failed.", error);
    response.status(401).json({
      success: false,
      message: "Authentication expired. Please login again.",
    });
    return null;
  }
}

/**
 * Returns a trimmed non-empty string.
 *
 * @param {unknown} value Raw input value.
 * @return {string|null} Trimmed string or null.
 */
function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Parses a submitted date.
 *
 * @param {unknown} value Raw date value.
 * @return {Date|null} Valid date or null.
 */
function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Converts stored date data to ISO text.
 *
 * @param {unknown} value Firestore date value.
 * @return {string|null} ISO date or null.
 */
function toIsoDate(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }

  return null;
}

/**
 * Serializes a Firestore crop document for the frontend.
 *
 * @param {DocumentSnapshot} snapshot Crop document snapshot.
 * @return {Record<string,unknown>} Crop API object.
 */
function serializeCrop(
  snapshot: DocumentSnapshot,
): Record<string, unknown> {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    cropName: data.cropName ?? "",
    cropVariety: data.cropVariety ?? "",
    landArea: data.landArea ?? 0,
    soilType: data.soilType ?? "",
    irrigationMethod: data.irrigationMethod ?? "",
    location: data.location ?? "",
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    sowingDate: toIsoDate(data.sowingDate),
    expectedHarvestDate: toIsoDate(data.expectedHarvestDate),
    createdAt: toIsoDate(data.createdAt),
    updatedAt: toIsoDate(data.updatedAt),
    userId: data.userId ?? "",
  };
}

/**
 * Validates a finite number inside a range.
 *
 * @param {unknown} value Raw number.
 * @param {number} minimum Minimum allowed value.
 * @param {number} maximum Maximum allowed value.
 * @return {boolean} Whether the number is valid.
 */
function isNumberInRange(
  value: unknown,
  minimum: number,
  maximum: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
  );
}

/**
 * Registers authenticated Firestore Crop routes.
 *
 * @param {express.Express} app Express application.
 * @param {Firestore} firestore Firestore Admin client.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerCropRoutes(
  app: express.Express,
  firestore: Firestore,
  adminAuth: Auth,
): void {
  app.post(
    "/api/crops",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );

      if (!decodedToken) {
        return;
      }

      const body = request.body ?? {};
      const cropName = requiredString(body.cropName);
      const cropVariety = requiredString(body.cropVariety);
      const soilType = requiredString(body.soilType);
      const irrigationMethod = requiredString(body.irrigationMethod);
      const location = requiredString(body.location);
      const sowingDate = parseDate(body.sowingDate);

      if (
        !cropName ||
        !cropVariety ||
        !soilType ||
        !irrigationMethod ||
        !location
      ) {
        response.status(400).json({
          success: false,
          message:
            "Crop name, variety, soil, irrigation, and location are " +
            "required.",
        });
        return;
      }

      if (!isNumberInRange(body.landArea, 0.01, 1000000)) {
        response.status(400).json({
          success: false,
          message: "Land area must be a positive number.",
        });
        return;
      }

      if (!isNumberInRange(body.latitude, -90, 90)) {
        response.status(400).json({
          success: false,
          message: "Latitude must be between -90 and 90.",
        });
        return;
      }

      if (!isNumberInRange(body.longitude, -180, 180)) {
        response.status(400).json({
          success: false,
          message: "Longitude must be between -180 and 180.",
        });
        return;
      }

      if (!sowingDate) {
        response.status(400).json({
          success: false,
          message: "Sowing date must be a valid date.",
        });
        return;
      }

      const expectedHarvestDate =
        body.expectedHarvestDate === "" ||
        body.expectedHarvestDate === null ||
        body.expectedHarvestDate === undefined ?
          null :
          parseDate(body.expectedHarvestDate);

      if (
        body.expectedHarvestDate !== "" &&
        body.expectedHarvestDate !== null &&
        body.expectedHarvestDate !== undefined &&
        !expectedHarvestDate
      ) {
        response.status(400).json({
          success: false,
          message: "Expected harvest date must be a valid date.",
        });
        return;
      }

      try {
        const now = Timestamp.now();
        const cropReference = firestore.collection("crops").doc();

        await cropReference.set({
          cropName,
          cropVariety,
          landArea: body.landArea,
          soilType,
          irrigationMethod,
          location,
          latitude: body.latitude,
          longitude: body.longitude,
          sowingDate: Timestamp.fromDate(sowingDate),
          expectedHarvestDate:
            expectedHarvestDate ?
              Timestamp.fromDate(expectedHarvestDate) :
              null,
          createdAt: now,
          updatedAt: now,
          userId: decodedToken.uid,
        });

        const createdSnapshot = await cropReference.get();

        response.status(201).json({
          success: true,
          message: "Crop created successfully.",
          data: serializeCrop(createdSnapshot),
        });
      } catch (error) {
        logger.error("Creating crop failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to save farm details.",
        });
      }
    },
  );

  app.get(
    "/api/crops",
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
          .collection("crops")
          .where("userId", "==", decodedToken.uid)
          .get();
        const crops = snapshot.docs
          .map(serializeCrop)
          .sort((left, right) => {
            const leftDate = String(left.createdAt ?? "");
            const rightDate = String(right.createdAt ?? "");
            return Date.parse(rightDate) - Date.parse(leftDate);
          });

        response.status(200).json({
          success: true,
          message: "Crops fetched successfully.",
          data: crops,
        });
      } catch (error) {
        logger.error("Fetching crops failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to fetch farm details.",
        });
      }
    },
  );

  app.get(
    "/api/crops/:id",
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
        const cropSnapshot = await firestore
          .collection("crops")
          .doc(String(request.params.id))
          .get();

        if (
          !cropSnapshot.exists ||
          cropSnapshot.data()?.userId !== decodedToken.uid
        ) {
          response.status(404).json({
            success: false,
            message: "Crop not found.",
          });
          return;
        }

        response.status(200).json({
          success: true,
          message: "Crop fetched successfully.",
          data: serializeCrop(cropSnapshot),
        });
      } catch (error) {
        logger.error("Fetching crop failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to fetch crop.",
        });
      }
    },
  );

  app.put(
    "/api/crops/:id",
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
        const cropReference = firestore
          .collection("crops")
          .doc(String(request.params.id));
        const existingSnapshot = await cropReference.get();

        if (
          !existingSnapshot.exists ||
          existingSnapshot.data()?.userId !== decodedToken.uid
        ) {
          response.status(404).json({
            success: false,
            message: "Crop not found.",
          });
          return;
        }

        const body = request.body ?? {};
        const updateData: Record<string, unknown> = {};

        for (const field of [
          "cropName",
          "cropVariety",
          "soilType",
          "irrigationMethod",
          "location",
        ]) {
          if (body[field] !== undefined) {
            const value = requiredString(body[field]);

            if (!value) {
              response.status(400).json({
                success: false,
                message: `${field} must be a non-empty string.`,
              });
              return;
            }

            updateData[field] = value;
          }
        }

        if (body.landArea !== undefined) {
          if (!isNumberInRange(body.landArea, 0.01, 1000000)) {
            response.status(400).json({
              success: false,
              message: "Land area must be a positive number.",
            });
            return;
          }

          updateData.landArea = body.landArea;
        }

        for (const coordinate of [
          {key: "latitude", minimum: -90, maximum: 90},
          {key: "longitude", minimum: -180, maximum: 180},
        ]) {
          if (body[coordinate.key] !== undefined) {
            if (
              !isNumberInRange(
                body[coordinate.key],
                coordinate.minimum,
                coordinate.maximum,
              )
            ) {
              response.status(400).json({
                success: false,
                message: `${coordinate.key} is invalid.`,
              });
              return;
            }

            updateData[coordinate.key] = body[coordinate.key];
          }
        }

        if (body.sowingDate !== undefined) {
          const sowingDate = parseDate(body.sowingDate);

          if (!sowingDate) {
            response.status(400).json({
              success: false,
              message: "Sowing date must be a valid date.",
            });
            return;
          }

          updateData.sowingDate = Timestamp.fromDate(sowingDate);
        }

        if (body.expectedHarvestDate !== undefined) {
          if (
            body.expectedHarvestDate === "" ||
            body.expectedHarvestDate === null
          ) {
            updateData.expectedHarvestDate = null;
          } else {
            const harvestDate = parseDate(body.expectedHarvestDate);

            if (!harvestDate) {
              response.status(400).json({
                success: false,
                message: "Expected harvest date must be valid.",
              });
              return;
            }

            updateData.expectedHarvestDate = Timestamp.fromDate(harvestDate);
          }
        }

        if (Object.keys(updateData).length === 0) {
          response.status(400).json({
            success: false,
            message: "No valid fields were provided for update.",
          });
          return;
        }

        updateData.updatedAt = Timestamp.now();
        await cropReference.update(updateData);
        const updatedSnapshot = await cropReference.get();

        response.status(200).json({
          success: true,
          message: "Crop updated successfully.",
          data: serializeCrop(updatedSnapshot),
        });
      } catch (error) {
        logger.error("Updating crop failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to update crop.",
        });
      }
    },
  );

  app.delete(
    "/api/crops/:id",
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
        const cropReference = firestore
          .collection("crops")
          .doc(String(request.params.id));
        const cropSnapshot = await cropReference.get();

        if (
          !cropSnapshot.exists ||
          cropSnapshot.data()?.userId !== decodedToken.uid
        ) {
          response.status(404).json({
            success: false,
            message: "Crop not found.",
          });
          return;
        }

        await cropReference.delete();
        response.status(200).json({
          success: true,
          message: "Crop deleted successfully.",
          data: null,
        });
      } catch (error) {
        logger.error("Deleting crop failed.", error);
        response.status(500).json({
          success: false,
          message: "Unable to delete crop.",
        });
      }
    },
  );
}
