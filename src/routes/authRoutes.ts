import { Router } from "express";
import {
  registerApp,
  getApiKey,
  revokeApiKey
} from "../controllers/authController";
import { getApiKeySchema, registerAppSchema, revokeApiKeySchema} from '../validators/authValdiator'
import validate from "../middlewares/validate";

const router = Router();

router.post("/register", validate(registerAppSchema), registerApp);
router.get("/api-key", validate(getApiKeySchema), getApiKey);
router.post("/revoke", validate(revokeApiKeySchema), revokeApiKey);

export default router;
