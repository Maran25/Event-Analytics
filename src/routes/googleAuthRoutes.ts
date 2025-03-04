import { Router } from "express";
import { googleAuth } from "../auth/googleAuth";
import { googleAuthCallback } from "../auth/googleAuthCallback";

const router = Router();

router.get("/", googleAuth);
router.get("/callback", googleAuthCallback);

export default router;
