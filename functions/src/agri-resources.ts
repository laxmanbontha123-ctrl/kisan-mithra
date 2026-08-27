import express, {Request, Response} from "express";
import {Auth} from "firebase-admin/auth";

/**
 * Reads a normalized query-string value.
 *
 * @param {unknown} value Raw query value.
 * @return {string} Normalized string.
 */
function getQueryString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parses and validates a geographic coordinate.
 *
 * @param {unknown} value Raw coordinate.
 * @param {number} minimum Minimum accepted value.
 * @param {number} maximum Maximum accepted value.
 * @return {number|null} Valid coordinate or null.
 */
function parseCoordinate(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  const normalized = getQueryString(value);
  const coordinate = Number(normalized);

  if (
    !normalized ||
    !Number.isFinite(coordinate) ||
    coordinate < minimum ||
    coordinate > maximum
  ) {
    return null;
  }

  return coordinate;
}

/**
 * Verifies the Firebase bearer token for a request.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {Promise<boolean>} Whether authentication succeeded.
 */
async function verifyRequestAuth(
  request: Request,
  response: Response,
  adminAuth: Auth,
): Promise<boolean> {
  const authorization = request.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    response.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return false;
  }

  try {
    await adminAuth.verifyIdToken(authorization.slice(7).trim());
    return true;
  } catch {
    response.status(401).json({
      success: false,
      message: "Authentication expired. Please login again.",
    });
    return false;
  }
}

/**
 * Builds an external Google Maps search URL around a location.
 *
 * @param {number} latitude Search latitude.
 * @param {number} longitude Search longitude.
 * @return {string} Encoded Google Maps search URL.
 */
function buildMapsSearchUrl(
  latitude: number,
  longitude: number,
): string {
  const query =
    "fertilizer pesticide agriculture input shop near " +
    `${latitude},${longitude}`;

  return "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query);
}

/**
 * Registers trustworthy agriculture resource routes.
 *
 * @param {express.Express} app Express application.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerAgriResourceRoutes(
  app: express.Express,
  adminAuth: Auth,
): void {
  app.get(
    "/api/agri-products/recommendations",
    async (request: Request, response: Response): Promise<void> => {
      if (!(await verifyRequestAuth(request, response, adminAuth))) {
        return;
      }

      const crop = getQueryString(request.query.crop);
      const problem = getQueryString(request.query.problem);

      if (!crop || !problem) {
        response.status(400).json({
          success: false,
          message: "crop and problem query parameters are required.",
        });
        return;
      }

      response.status(200).json({
        success: true,
        available: false,
        message: "Verified product registry is currently unavailable.",
        data: [],
        disclaimer:
          "No product, dosage, price, stock, or shop claims are shown " +
          "until records have a documented source and verification time.",
        source: {
          category: "Currently Unavailable",
          provider: null,
          lastUpdatedAt: null,
          location: null,
          confidence: null,
          expiresAt: null,
        },
      });
    },
  );

  app.get(
    "/api/agri-shops/nearby",
    async (request: Request, response: Response): Promise<void> => {
      if (!(await verifyRequestAuth(request, response, adminAuth))) {
        return;
      }

      const latitude = parseCoordinate(request.query.lat, -90, 90);
      const longitude = parseCoordinate(request.query.lon, -180, 180);

      if (latitude === null || longitude === null) {
        response.status(400).json({
          success: false,
          message: "Valid lat and lon query parameters are required.",
        });
        return;
      }

      response.status(200).json({
        success: true,
        configured: false,
        message: "In-app verified shop results are currently unavailable.",
        data: [],
        mapsSearchUrl: buildMapsSearchUrl(latitude, longitude),
        disclaimer:
          "The external Google Maps search is not verified by Kisan Mithra. " +
          "Confirm shop identity, stock, price, and product suitability.",
        source: {
          category: "Currently Unavailable",
          provider: null,
          lastUpdatedAt: null,
          location: {
            latitude,
            longitude,
          },
          confidence: null,
          expiresAt: null,
        },
      });
    },
  );
}
