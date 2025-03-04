import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.header("x-api-key");
  const { user_id } = res.locals.userData;

  if (!apiKey) {
    res.status(401).json({ message: "API key is required" });
    return;
  }

  try {
    const data = await pool.query(
      `SELECT * FROM apps WHERE api_key = $1 AND user_id = $2`,
      [apiKey, user_id]
    );

    if (!data.rows.length) {
      res.status(403).json({ message: "Invalid API Key" });
      return;
    }

    res.locals.appData = data.rows[0];
    next();
  } catch (error: any) {
    res.status(500).json({ message: "Failed to authenticate API key" });
  }
};
