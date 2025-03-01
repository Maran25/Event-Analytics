import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API key is missing" });
  }

  try {
    const data = await pool.query(`SELECT * FROM apps WHERE api_key = $1`, [
      apiKey,
    ]);

    if (!data.rows.length) {
      return res.status(403).json({ message: "Invalid API Key" });
    }

    res.locals.appData = data.rows[0]
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to authenticate API key' });
  }
};
