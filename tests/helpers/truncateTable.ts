import pool from "../../src/config/db";

export const truncateTables = async () => {
  try {
    await pool.query(
      "TRUNCATE TABLE users, apps, events RESTART IDENTITY CASCADE"
    );
  } catch (error: any) {
    console.error("Error occured while truncating table: ", error.message);
  }
};
