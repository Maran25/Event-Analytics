import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import pool from "../config/db";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.API_URL}/auth/google/callback`
);
const JWT_SECRET = process.env.JWT_SECRET;

export const googleAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).json({ message: "Authorization code is missing" });
    return 
  }

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code as string);
    const idToken = tokens.id_token;

    if (!idToken) {
      res.status(400).json({ message: "Failed to retrieve ID token" });
      return;
    }

    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(400).json({ message: "Invalid ID token" });
      return;
    }

    const { sub: googleId, email, name } = payload;

    // Find or create user in database
    let user = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);

    if (!user.rowCount) {
      user = await pool.query(
        "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *",
        [googleId, email || '', name || '']
      );
    }

    // Generate JWT for app
    const jwtToken = jwt.sign({ user_id: user.rows[0].id }, JWT_SECRET!, { expiresIn: "1h" });

    res.status(200).json({ token: jwtToken });
  } catch (error) {
    console.error("Google Auth error:", error);
    res.status(500).json({ message: "Failed to authenticate with Google" });
  }
};
