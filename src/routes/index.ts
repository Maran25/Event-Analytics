import { Router } from "express";
import analyticsRoutes from "./analyticsRoutes";
import authRoutes from "./authRoutes";
import { getRequestData } from "../middlewares/getRequestData";
import { validateApiKey } from "../middlewares/validateApiKey";

const router = Router();

router.use("/analytics", getRequestData, validateApiKey, analyticsRoutes);

router.use("/auth", getRequestData, authRoutes);

export default router;
