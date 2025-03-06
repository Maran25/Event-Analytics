import { Router } from "express";
import {
  collectEvent,
  eventSummary,
  userStats,
} from "../controllers/analyticsController";
import { collectEventSchema, eventSummarySchema, userStatsSchema } from '../validators/analyticsValidator'
import validate from "../middlewares/validate";
import { validateApiKey } from "../middlewares/validateApiKey";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API for collecting and retrieving analytics data
 */

/**
 * @swagger
 * /analytics/collect:
 *   post:
 *     summary: Collect event data
 *     tags: [Analytics]
 *     description: Collect analytics event data like event name, URL, referrer, and device info.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *               url:
 *                 type: string
 *               referrer:
 *                 type: string
 *               device:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               metadata:
 *                 type: object
 *                 properties:
 *                   browser:
 *                     type: string
 *                   os:
 *                     type: string
 *                   screenSize:
 *                     type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event collected successfully
 *       400:
 *         description: Validation error
 */
router.post("/collect", validateApiKey, validate(collectEventSchema), collectEvent);

/**
 * @swagger
 * /analytics/event-summary:
 *   get:
 *     summary: Get event summary
 *     tags: [Analytics]
 *     description: Retrieve a summary of events with optional filters for date and app_id.
 *     parameters:
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *         required: true
 *         description: Event name to filter by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: App ID to filter events
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 uniqueUsers:
 *                   type: integer
 *                 deviceData:
 *                   type: object
 *                   properties:
 *                     mobile:
 *                       type: integer
 *                     desktop:
 *                       type: integer
 *       400:
 *         description: Validation error
 */
router.get("/event-summary", validate(eventSummarySchema), eventSummary);

/**
 * @swagger
 * /analytics/user-stats:
 *   get:
 *     summary: Get user stats
 *     tags: [Analytics]
 *     description: Retrieve user stats based on userId.
 *     parameters:
 *       - in: query
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to fetch stats for
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 totalEvents:
 *                   type: integer
 *                 deviceDetails:
 *                   type: object
 *                   properties:
 *                     browser:
 *                       type: string
 *                     os:
 *                       type: string
 *                 ipAddress:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: "User not found"
 */
router.get("/user-stats", validate(userStatsSchema), userStats);

export default router;
