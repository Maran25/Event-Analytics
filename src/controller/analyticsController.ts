import { Response } from "express";
import { AuthenticatedRequest } from "../types/customRequest";
import pool from "../config/db";

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
    await pool.query(
      `INSERT INTO 
      events (app_id, owner_user_id, end_user_id, event, url, referrer, device, ip_address, timestamp, metadata 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
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
      ]
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
