import { Response } from "express";
import { AuthenticatedRequest } from "../types/customRequest";
import pool from "../config/db";
import { Queue } from "bullmq";
import redis from "../config/redis";

const eventQueue = new Queue("events", { connection: redis });

export const collectEvent = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const app_id = req.appData?.id;
  const owner_user_id = req.appData?.userid;
  const {
    event,
    url,
    referrer,
    device,
    ipAddress,
    timestamp,
    metadata,
    enduserid,
  } = res.locals.reqdata;

  if (!event || !url || !timestamp) {
    return res
      .status(400)
      .json({ message: "Missing required fields: event, url, timestamp" });
  }

  try {
    await eventQueue.add(
      "collect-event",
      {
        app_id,
        owner_user_id,
        enduserid,
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

  try {
    let query = `
        SELECT event, COUNT(*) AS count, COUNT(DISTINCT user_id) AS uniqueUsers,
          json_object_agg(device, count) AS deviceData
        FROM events
        WHERE event = $1
      `;
    const params = [event];

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

    query += " GROUP BY event";

    const result = await pool.query(query, params);
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event summary" });
  }
};

export const userStats = async (req: AuthenticatedRequest, res: Response) => {
  const { userid } = res.locals.reqdata;

  try {
    const data = await pool.query(
      `SELECT userId, COUNT(*) AS totalEvents,
              json_build_object('browser', metadata->>'browser', 'os', metadata->>'os') AS deviceDetails,
              (SELECT ip_address FROM events WHERE user_id = $1 ORDER BY DESC LIMIT 1) AS ipAddress
       FROM events
       WHERE userId = $1
       GROUP BY userId, metadata`,
      [userid]
    );

    if (!data.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(data.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
