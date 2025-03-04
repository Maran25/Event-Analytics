import { Queue } from "bullmq";
import { Response } from "express";
import { Redis } from "ioredis";
import pool from "../config/db";
import redis from "../config/redis";
import { AuthenticatedRequest } from "../types/customRequest";

const eventQueue = new Queue("events", { connection: redis });
const cache = new Redis();

export const collectEvent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const app_id = req.appData?.id;
  const user_id = req.appData?.userid;
  const {
    event,
    url,
    referrer,
    device,
    ipAddress,
    timestamp,
    metadata,
    actor_id,
  } = res.locals.reqdata;

  try {
    await eventQueue.add(
      "collect-event",
      {
        app_id,
        user_id,
        actor_id,
        event,
        url,
        referrer,
        device,
        ipAddress,
        timestamp,
        metadata,
      },
      { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
    );

    res.status(200).json({ message: "Event collected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error collecting event" });
  }
};

export const eventSummary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { event, startDate, endDate, app_id } = res.locals.reqdata;
  const { user_id } = res.locals.userData;
  const cacheKey = `eventSummary:${event}:${startDate || ""}:${endDate || ""}:${
    app_id || ""
  }`;

  try {
    const cachedSummary = await cache.get(cacheKey);
    if (cachedSummary) {
      res.status(200).json(JSON.parse(cachedSummary));
      return;
    }

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
    const summary = result.rows[0] || {
      event,
      count: 0,
      uniqueUsers: 0,
      deviceData: {},
    };

    await cache.set(cacheKey, JSON.stringify(summary), "EX", 3600);

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event summary" });
  }
};

export const userStats = async (req: AuthenticatedRequest, res: Response) => {
  const { userid } = res.locals.reqdata;
  const { user_id } = res.locals.userData;
  const cacheKey = `userStats:${userid}:${user_id}`;

  try {
    const cachedStats = await cache.get(cacheKey);
    if (cachedStats) {
      res.status(200).json(JSON.parse(cachedStats));
      return;
    }

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
    

    if (!data.rows.length) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userStats = data.rows[0];
    await cache.set(cacheKey, JSON.stringify(userStats), "EX", 3600);

    res.status(200).json(userStats);
  } catch (error: any) {
    console.log("what is userstats error***", error.message);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
