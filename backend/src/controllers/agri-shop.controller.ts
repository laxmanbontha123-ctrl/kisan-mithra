import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { agriShopService } from "../services/agri-shop.service";

function toNumber(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export const getNearbyAgriShops = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const latitude = toNumber(req.query.lat);
  const longitude = toNumber(req.query.lon);

  if (latitude === null || longitude === null) {
    res.status(400).json({
      success: false,
      message: "lat and lon query parameters are required.",
    });
    return;
  }

  try {
    const result = await agriShopService.findNearbyAgriShops({
      latitude,
      longitude,
    });

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch nearby agri shops.";
    res.status(500).json({ success: false, message });
  }
};

export default { getNearbyAgriShops };
