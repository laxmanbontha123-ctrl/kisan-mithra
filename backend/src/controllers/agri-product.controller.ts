import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { agriProductService } from "../services/agri-product.service";

export const getAgriProductRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  const crop = typeof req.query.crop === "string" ? req.query.crop.trim() : "";
  const problem = typeof req.query.problem === "string" ? req.query.problem.trim() : "";

  if (!crop || !problem) {
    res.status(400).json({
      success: false,
      message: "crop and problem query parameters are required.",
    });
    return;
  }

  try {
    const result = await agriProductService.getRecommendations({
      crop,
      problem,
    });

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch agri product recommendations.";
    res.status(500).json({ success: false, message });
  }
};

export default { getAgriProductRecommendations };
