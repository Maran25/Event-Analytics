import { Pool } from "pg";
import env from "dotenv";

env.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.log("Unexpected Error from PostgreSQl: ", err);
  process.exit(-1);
});

export const closePool = async () => {
  await pool.end();
  console.log("PostgreSQL pool has been closed.");
};

export default pool;
