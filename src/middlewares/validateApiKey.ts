import { Request, Response, NextFunction } from "express";
import pool from "../config/db";

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    res.status(401).json({ message: "API key is missing" });
    return;
  }

  try {
    const data = await pool.query(`SELECT * FROM apps WHERE api_key = $1`, [
      apiKey,
    ]);

    if (!data.rows.length) {
      res.status(403).json({ message: "Invalid API Key" });
      return 
    }

    res.locals.appData = data.rows[0]
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to authenticate API key' });
  }
};
