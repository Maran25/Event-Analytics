import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://redis:6379");

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Error connecting to Redis: ", err);
});

export const closeRedis = async () => {
  await redis.flushdb();
  await redis.quit();
  console.log("Redis cache cleared and connection closed.");
};

export default redis;
