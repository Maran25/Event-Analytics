import { truncateTables } from "./tests/helpers/truncateTable";
import { closePool } from "./src/config/db";
import { closeRedis } from "./src/config/redis";
import { closeServer } from "./src";

export default async () => {
  try {
    console.log("Starting global teardown...");
    await truncateTables(); // Clear tables
    await closePool(); // Close PostgreSQL pool
    await closeRedis(); // Close Redis connection
    await closeServer(); // Stop Express server
    console.log("Global teardown completed.");
  } catch (error) {
    console.error("Error during global teardown:", error);
  }
};
