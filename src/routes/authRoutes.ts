import { Router } from "express";
import {
  registerApp,
  getApiKey,
  revokeApiKey
} from "../controllers/authController";

const router = Router();

router.post("/register", registerApp);
router.get("/api-key", getApiKey);
router.post("/revoke", revokeApiKey);

export default router;
