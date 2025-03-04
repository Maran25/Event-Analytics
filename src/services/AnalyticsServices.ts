import { Queue } from "bullmq";
import { Redis } from "ioredis";
import pool from "../config/db";
import redis from "../config/redis";

export class AnalyticsService {
  private eventQueue: Queue;
  private cache: Redis;

  constructor() {
    this.eventQueue = new Queue("events", { connection: redis });
    this.cache = new Redis();
  }

  async collectEvent(data: any): Promise<void> {
    await this.eventQueue.add("collect-event", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    });
  }

  async getEventSummary(event: string, startDate?: string, endDate?: string, app_id?: string, user_id?: string): Promise<any> {
    const cacheKey = `eventSummary:${event}:${startDate || ""}:${endDate || ""}:${app_id || ""}`;
    const cachedSummary = await this.cache.get(cacheKey);
    if (cachedSummary) return JSON.parse(cachedSummary);

    let query = `
      SELECT 
        event, 
        COUNT(*)::int AS count, 
        COUNT(DISTINCT actor_id) AS "uniqueUsers",
        json_object_agg(device, device_count) AS "deviceData"
      FROM (
        SELECT 
          event,
          actor_id,
          device,
          COUNT(*)::int AS device_count
        FROM events
        WHERE event = $1 AND user_id = $2
    `;
    const params = [event, user_id];

    if (startDate) {
      query += ` AND timestamp >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND timestamp <= $${params.length + 1}`;
      params.push(endDate);
    }
    if (app_id) {
      query += ` AND app_id = $${params.length + 1}`;
      params.push(app_id);
    }

    query += `
        GROUP BY event, actor_id, device
      ) AS subquery
      GROUP BY event;
    `;

    const result = await pool.query(query, params);
    const summary = result.rows[0] || { event, count: 0, uniqueUsers: 0, deviceData: {} };
    await this.cache.set(cacheKey, JSON.stringify(summary), "EX", 3600);

    return summary;
  }

  async getUserStats(userid: string, user_id: string): Promise<any> {
    const cacheKey = `userStats:${userid}:${user_id}`;
    const cachedStats = await this.cache.get(cacheKey);
    if (cachedStats) return JSON.parse(cachedStats);

    const data = await pool.query(
      `
      WITH latest_event AS (
        SELECT 
          actor_id,
          ip_address,
          metadata,
          timestamp
        FROM events
        WHERE actor_id = $1 AND user_id = $2
        ORDER BY timestamp DESC
        LIMIT 1
      )
      
      SELECT 
        e.actor_id AS "userId",
        COUNT(*)::int AS "totalEvents",
        json_build_object(
          'browser', le.metadata->>'browser',
          'os', le.metadata->>'os'
        ) AS "deviceDetails",
        le.ip_address AS "ipAddress"
      
      FROM events e
      JOIN latest_event le ON e.actor_id = le.actor_id
      
      WHERE e.actor_id = $1 AND e.user_id = $2
      
      GROUP BY 
        e.actor_id,
        le.metadata,
        le.ip_address;
      `,
      [userid, user_id]
    );

    const userStats = data.rows[0] || null;
    if (userStats) await this.cache.set(cacheKey, JSON.stringify(userStats), "EX", 3600);

    return userStats;
  }
}
