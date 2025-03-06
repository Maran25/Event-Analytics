import { Router } from "express";
import {
  registerApp,
  getApiKey,
  revokeApiKey
} from "../controllers/authController";
import validate from "../middlewares/validate";
import { getApiKeySchema, registerAppSchema, revokeApiKeySchema } from '../validators/authValdiator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for app registration, API key management, and key revocation
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new app
 *     tags: [Authentication]
 *     description: Registers an app by providing its name and ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "My Analytics App"
 *             id: "app123"
 *     responses:
 *       200:
 *         description: App registered successfully
 *         content:
 *           application/json:
 *             example:
 *               api_key: "f4c2e4d3a8b9..."
 *       400:
 *         description: Invalid input
 */
router.post("/register", validate(registerAppSchema), registerApp);

/**
 * @swagger
 * /auth/api-key:
 *   get:
 *     summary: Get API key for an app
 *     tags: [Authentication]
 *     description: Retrieves the API key for a registered app using its ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The app ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key retrieved
 *         content:
 *           application/json:
 *             example:
 *               api_key: "f4c2e4d3a8b9..."
 *       400:
 *         description: Invalid input
 *       404:
 *         description: App not found
 */
router.get("/api-key", validate(getApiKeySchema), getApiKey);

/**
 * @swagger
 * /auth/revoke:
 *   post:
 *     summary: Revoke an API key
 *     tags: [Authentication]
 *     description: Revokes an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             apikey: "f4c2e4d3a8b9..."
 *     responses:
 *       200:
 *         description: API key revoked
 *       400:
 *         description: Invalid input
 *       404:
 *         description: API key not found
 */
router.post("/revoke", validate(revokeApiKeySchema), revokeApiKey);

export default router;
