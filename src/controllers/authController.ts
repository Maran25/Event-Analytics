import { Request, Response } from "express";
import { Redis } from "ioredis";
import uuid from 'uuid';
import pool from "../config/db";

const cache = new Redis();

export const registerApp = async (_: Request, res: Response) => {
  const { name, id, userid } = res.locals.reqdata;

  const apikey = uuid.v4()

  try {
    const doesExists = await pool.query("SELECT * FROM apps WHERE id = $1", [
      id,
    ]);
    if (doesExists.rows.length > 0) {
      res.status(400).json({ message: "App already exists" });
      return;
    }

    await pool.query(
      "INSERT INTO apps (name, id, api_key, userid) VALUES ($1, $2, $3, $4)",
      [name, id, apikey, userid]
    );
    res.status(200).json({ apikey });
  } catch (error) {
    res.status(500).json({ message: "Error registering app" });
  }
};

export const getApiKey = async (_: Request, res: Response) => {
  const { id } = res.locals.reqdata;

  try {
    const cachedApiKey = await cache.get(`api_key:${id}`);

    if (cachedApiKey) {
      res.status(200).json({ apikey: cachedApiKey });
      return;
    }

    const data = await pool.query("SELECT api_key FROM apps WHERE id = $1", [
      id,
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

  try {
    await pool.query("DELETE FROM apps WHERE api_key = $1", [
      apikey,
    ]);
    await cache.del(`api_key:${apikey}`);

    res.status(200).json({ message: "API Key revoked" });
  } catch (error) {
    res.status(500).json({ message: "Error revoking API Key" });
  }
};
