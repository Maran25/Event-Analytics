import { Router } from "express";
import {
  collectEvent,
  eventSummary,
  userStats,
} from "../controllers/analyticsController";

const router = Router();

router.post("/collect", collectEvent);
router.get("/event-summary", eventSummary);
router.get("/user-stats", userStats);

export default router;
