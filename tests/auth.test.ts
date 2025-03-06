import request from "supertest";
import server from "../src/index";
import { createTestUser } from "./helpers/createTestUser";
import { testPool } from "./setupTestDB";

describe("Analytics Routes", () => {
  const appId = "test-app-id";
  const appName = "Test App";
  let token: string;
  let apiKey: string;
  let userId: string;

  beforeAll(async () => {
    const { token: usertoken, userid } = await createTestUser();
    token = usertoken;
    userId = userid;
  });

  // ============================
  // Auth Route - Register App
  // ============================

  describe("Register App", () => {
    it("Pass -> should register a new app and return an API key", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ name: appName, id: appId })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.apikey).toBeDefined();
      apiKey = res.body.apikey;

      const dbCheck = await testPool.query(
        "SELECT * FROM apps WHERE id = $1 AND user_id = $2",
        [appId, userId]
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].api_key).toBe(apiKey);
    });

    it("Fail -> should return app already exists", async () => {
      const res = await request(server)
        .post("/api/auth/register")
        .send({ name: appName, id: appId })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual("App already exists");
    });
  });

  // ============================
  // Auth Route - Get API Key
  // ============================

  describe("Get API Key", () => {
    it("Pass -> should get the API key for a registered app", async () => {
      const res = await request(server)
        .get(`/api/auth/api-key?id=${appId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.apikey).toBe(apiKey);
    });

    it("Fail -> Invalid Id", async () => {
      const res = await request(server)
        .get(`/api/auth/api-key?id=appId`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('App not found');
    });
  });

  // ============================
  // Auth Route - Revoke API Key
  // ============================

  describe("Auth Route - Revoke API Key", () => {
    it("Pass -> API Key should be revoked now", async () => {
      const res = await request(server)
        .post(`/api/auth/revoke`)
        .send({ apikey: apiKey })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toEqual("API Key revoked");
    });

    it("Pass -> app does not exist in the db", async () => {
      const data = await testPool.query(
        "SELECT * FROM apps WHERE api_key = $1",
        [apiKey]
      );

      expect(data.rowCount).toBe(0);
    });
  });
});
