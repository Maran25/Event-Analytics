import crypto from 'crypto';
import { Redis } from "ioredis";
import pool from "../config/db";

const cache = new Redis();

export class AuthService {
  async appExists(id: string) {
    const result = await pool.query("SELECT * FROM apps WHERE id = $1", [id]);
    return result.rows.length > 0;
  }

  async registerApp(name: string, id: string, user_id: number) {
    const apikey = crypto.randomBytes(32).toString("hex");
    await pool.query(
      "INSERT INTO apps (name, id, api_key, user_id) VALUES ($1, $2, $3, $4)",
      [name, id, apikey, user_id]
    );
    return apikey;
  }

  async getApiKey(id: string, user_id: number) {
    const cachedApiKey = await cache.get(`api_key:${id}`);
    if (cachedApiKey) return cachedApiKey;

    const result = await pool.query(
      "SELECT api_key FROM apps WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (!result.rowCount) return null;

    const apikey = result.rows[0].api_key;
    await cache.set(`api_key:${id}`, apikey, "EX", 3600);
    return apikey;
  }

  async revokeApiKey(apikey: string, user_id: number) {
    await pool.query("DELETE FROM apps WHERE api_key = $1 AND user_id = $2", [
      apikey,
      user_id
    ]);
    await cache.del(`api_key:${apikey}`);
  }
}