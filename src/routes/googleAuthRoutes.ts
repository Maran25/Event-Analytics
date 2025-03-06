import { Router } from "express";
import { googleAuth } from "../auth/googleAuth";
import { googleAuthCallback } from "../auth/googleAuthCallback";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Google OAuth
 *   description: Google OAuth for user authentication
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Redirect to Google OAuth
 *     tags: [Google OAuth]
 *     description: Initiates Google OAuth by redirecting to Google's consent screen.
 *     responses:
 *       302:
 *         description: Redirects to Google consent screen
 */
router.get("/", googleAuth);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Google OAuth]
 *     description: Handles Google OAuth callback, verifies the authorization code, retrieves user info, and issues a JWT.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: The authorization code returned by Google
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             example:
 *               token: "jwt_token_here"
 *       400:
 *         description: Invalid authorization code or token
 *       500:
 *         description: Internal server error
 */
router.get("/callback", googleAuthCallback);

export default router;
