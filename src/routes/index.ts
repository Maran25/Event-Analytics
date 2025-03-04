import { Router } from "express";
import { getRequestData } from "../middlewares/getRequestData";
import { verifyToken } from "../middlewares/verifyToken";
import analyticsRoutes from "./analyticsRoutes";
import authRoutes from "./authRoutes";
import googleAuthRoutes from "./googleAuthRoutes";

const router = Router();

router.use("/auth/google", googleAuthRoutes);

router.use("/analytics", getRequestData, verifyToken, analyticsRoutes);

router.use("/auth", getRequestData, verifyToken, authRoutes);

export default router;
