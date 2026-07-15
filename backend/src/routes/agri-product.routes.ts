import { Router } from "express";
import { getAgriProductRecommendations } from "../controllers/agri-product.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/recommendations", getAgriProductRecommendations);

export default router;
