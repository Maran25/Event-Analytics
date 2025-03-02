import { Router } from "express";
import {
  collectEvent,
  eventSummary,
  userStats,
} from "../controllers/analyticsController";
import { collectEventSchema, eventSummarySchema, userStatsSchema } from '../validators/analyticsValidator'
import validate from "../middlewares/validate";

const router = Router();

router.post("/collect", validate(collectEventSchema), collectEvent);
router.get("/event-summary", validate(eventSummarySchema), eventSummary);
router.get("/user-stats", validate(userStatsSchema), userStats);

export default router;
