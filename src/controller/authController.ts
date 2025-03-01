import { Request, Response } from "express";
import crypto from "crypto";
import pool from "../config/db";

export const registerApp = async (req: Request, res: Response) => {
  const { name, id } = req.body;

  const apikey = crypto.randomBytes(32).toString("hex");

  try {
    await pool.query(
      "INSERT INTO apps (app_name, app_id, api_key) VALUES ($1, $2, $3)",
      [name, id, apikey]
    );
    res.status(200).json({ apikey });
  } catch (error) {
    res.status(500).json({ message: 'Error registering app'})
  }
};


export const getApiKey = async (req: Request, res: Response) => {
    const { id } = req.body;

    try {
        const data = await pool.query('SELECT api_key FROM apps WHERE app_id = $1', [id])

        if(!data) {
            res.status(404).json({ message: 'App not found' })
        };

        res.status(200).json({ apikey: data.rows[0].apikey })
    } catch (error) {
        res.status(500).json({ message: 'Error getting api key' })
    }
}

export const revokeApiKey = async (req: Request, res: Response) => {
    const { apikey } = req.body;

    try {
        await pool.query('DELETE FROM apps WHERE api_key = $1', [apikey])

        res.status(200).json({ message: 'API Key revoked' })
    } catch (error) {
        res.status(500).json({ message: 'Error revoking API Key' })
    }
}