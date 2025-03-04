import { Request, Response } from "express";
import { Redis } from "ioredis";
import crypto from 'crypto';
import pool from "../config/db";

const cache = new Redis();

export const registerApp = async (_: Request, res: Response) => {
  const { name, id } = res.locals.reqdata;
  const { user_id } = res.locals.userData

  const apikey = crypto.randomBytes(32).toString("hex");

  try {
    const doesExists = await pool.query("SELECT * FROM apps WHERE id = $1", [
      id,
    ]);
    if (doesExists.rows.length > 0) {
      res.status(400).json({ message: "App already exists" });
      return;
    }

    await pool.query(
      "INSERT INTO apps (name, id, api_key, user_id) VALUES ($1, $2, $3, $4)",
      [name, id, apikey, user_id]
    );
    res.status(200).json({ apikey });
  } catch (error: any) {
    console.log('waht is the register err', error.message)
    res.status(500).json({ message: "Error registering app" });
  }
};

export const getApiKey = async (_: Request, res: Response) => {
  const { id } = res.locals.reqdata;
  const { user_id } = res.locals.userData

  try {
    const cachedApiKey = await cache.get(`api_key:${id}`);

    if (cachedApiKey) {
      res.status(200).json({ apikey: cachedApiKey });
      return;
    }

    console.log('raahhhh', (await pool.query('SELECT * FROM apps')).rows[0], { id, user_id })
    const data = await pool.query("SELECT api_key FROM apps WHERE id = $1 AND user_id = $2", [
      id,
      user_id
    ]);

    if (!data.rowCount) {
      res.status(404).json({ message: "App not found" });
      return;
    }

    const apikey = data.rows[0].api_key;
    await cache.set(`api_key:${id}`, apikey, "EX", 3600); // Cache for 1 hour

    res.status(200).json({ apikey });
  } catch (error: any) {
    res.status(500).json({ message: "Error getting api key" });
  }
};

export const revokeApiKey = async (_: Request, res: Response) => {
  const { apikey } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    await pool.query("DELETE FROM apps WHERE api_key = $1 AND user_id = $2", [
      apikey,
      user_id
    ]);
    await cache.del(`api_key:${apikey}`);

    res.status(200).json({ message: "API Key revoked" });
  } catch (error) {
    res.status(500).json({ message: "Error revoking API Key" });
  }
};
