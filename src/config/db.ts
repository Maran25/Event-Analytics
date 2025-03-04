import { Pool } from "pg";
import env from "dotenv";

env.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
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
