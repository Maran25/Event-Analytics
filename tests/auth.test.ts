import request from "supertest";
import server from "../src/index";
import { createTestUser } from "./helpers/createTestUser";
import { registerApp } from "./helpers/registerApp";
import { testPool } from "./setupTestDB";

// ============================
// Auth Route - Register App
// ============================

describe("Auth Route - Register App", () => {
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

  it("Pass -> should register a new app and return an API key", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ name: appName, id: appId })
      .set("Authorization", `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.apikey).toBeDefined();
    apiKey = res.body.apikey;

    const dbCheck = await testPool.query("SELECT * FROM apps WHERE id = $1 AND user_id = $2", [
      appId,
      userId
    ]);
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

  it("Fail -> without the name", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ id: appId })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"name" is required');
  });

  it("Fail -> without the id", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ name: appName })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"id" is required');
  });
});

// ============================
// Auth Route - Get API Key
// ============================

describe("Auth Route - Get API Key", () => {
  const appId = "test-app-id";
  let token: string;
  let apiKey: string;

  beforeAll(async () => {
    const { token: usertoken } = await createTestUser();
    token = usertoken;
    const { apikey } = await registerApp({ id: appId, token });
    apiKey = apikey;
  });

  it("Pass -> should get the API key for a registered app", async () => {
    const res = await request(server)
      .get(`/api/auth/api-key?id=${appId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.apikey).toBe(apiKey);
  });

  it("Fail -> Without the id", async () => {
    const res = await request(server)
      .get(`/api/auth/api-key`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"id" is required');
  });
});

// ============================
// Auth Route - Revoke API Key
// ============================

describe("Auth Route - Revoke API Key", () => {
  const appId = "test-app-id";
  const appName = "Test App";
  let token: string;
  let apiKey: string;

  beforeAll(async () => {
    const { token: usertoken } = await createTestUser();
    token = usertoken;
    const { apikey } = await registerApp({ id: appId, name: appName, token });
    apiKey = apikey;
  });

  it("Pass -> API Key should be revoked now", async () => {
    const res = await request(server)
      .post(`/api/auth/revoke`)
      .send({ apikey: apiKey })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("API Key revoked");
  });

  it("Pass -> stored in cache", async () => {
    const res = await request(server)
      .get(`/api/auth/api-key?id=${appId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.apikey).toBe(apiKey);
  });

  it("Pass -> app does not exist in the db", async () => {
    const data = await testPool.query("SELECT * FROM apps WHERE api_key = $1", [
      apiKey,
    ]);

    expect(data.rowCount).toBe(0);
  });

  it("Fail -> Without the apikey", async () => {
    const res = await request(server)
      .post(`/api/auth/revoke`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"apikey" is required');
  });
});