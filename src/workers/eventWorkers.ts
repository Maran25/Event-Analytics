import { Worker } from "bullmq";
import redis from "../config/redis";
import pool from "../config/db";

const worker = new Worker(
  "events",
  async (job) => {
    const {
      app_id,
      event,
      owner_user_id,
      url,
      referrer,
      device,
      ipAddress,
      timestamp,
      metadata,
      actor_id,
    } = job.data;

    try {
      await pool.query(
        `INSERT INTO 
        events (app_id, user_id, actor_id, event, url, referrer, device, ip_address, timestamp, metadata 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
        [
          app_id,
          owner_user_id,
          actor_id,
          event,
          url,
          referrer,
          device,
          ipAddress,
          timestamp,
          metadata,
        ]
      );

      console.log(`Processed event for app: ${app_id}`);
    } catch (err) {
      console.error("Failed to process event:", err);
      throw err; // Allows for retry if configured
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

worker.on("failed", (job, err) => {
  console.error(`Job failed for app: ${job?.data?.app_id}`, err);
});
