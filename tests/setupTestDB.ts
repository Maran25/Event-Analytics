import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: ".env.test" });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  database: "postgres", // Using the default database
};

// const randomSuffix = Math.floor(Math.random() * 10000);
const dbName = process.env.DB_NAME;

export const testPool = new Pool({ ...dbConfig, database: dbName });

const setupTestDB = async () => {
  const pool = new Pool(dbConfig);

  try {
    const client = await pool.connect();

    // Check if test database exists
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbExists.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Test database '${dbName}' created.`);
    } else {
      console.log(`Test database '${dbName}' already exists.`);
    }

    client.release();
    await pool.end(); // Close the initial connection

    // Connect to the test database
    const testClient = await testPool.connect();

    // Run setup.sql to initialize schema
    const sql = fs.readFileSync(path.join(__dirname, "sql/setup.sql"), "utf-8");
    await testClient.query(sql);
    console.log("Tables and schema set up.");

    testClient.release();
    await testPool.end();
  } catch (err) {
    console.error("Error setting up test database:", err);
    process.exit(1);
  }
};

export const createTestDB = () => {
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });
};

export const startTransaction = async (pool: Pool) => {
  const client = await pool.connect();
  await client.query("BEGIN");
  return client;
};

export const rollbackTransaction = async (client: PoolClient) => {
  await client.query("ROLLBACK");
  client.release();
};

export const closeTestDB = async (pool: Pool) => {
  await pool.end();
};

export default setupTestDB;
