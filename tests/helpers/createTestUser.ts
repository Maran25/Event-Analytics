import jwt from "jsonwebtoken";
import pool from "../../src/config/db";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const createTestUser = async (): Promise<{
  token: string;
  userid: string;
}> => {
  const googleId = "test-google-id";
  const email = "testuser@gmail.com";
  const name = "Test User";

  // insert a test user into the database (or update if exists)
  const data = await pool.query(
    `INSERT INTO users (google_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (google_id) DO NOTHING
     RETURNING id`,
    [googleId, email, name]
  );
  
  const userid = data.rows.length ? data.rows[0].id : null;

  const token = jwt.sign({ user_id: userid }, JWT_SECRET!, { expiresIn: "1h" });

  return { token, userid };
};
