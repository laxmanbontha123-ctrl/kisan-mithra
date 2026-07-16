import { Router } from "express";
import { getNearbyAgriShops } from "../controllers/agri-shop.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/nearby", getNearbyAgriShops);

export default router;
