import request from "supertest";
import server from "../../src/index";
import { createTestUser } from "../helpers/createTestUser";
import { testPool } from "../setupTestDB";

describe("Auth Route - Register App", () => {
  let appId = "test-app-id";
  let apiKey: string;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const { token: usertoken, userid } = await createTestUser();
    token = usertoken;
    userId = userid;
  })

  it("Pass -> should register a new app and return an API key", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ name: "Test App", id: appId })
      .set("Authorization", `Bearer ${token}`);
      console.log('response***', res.body)

    expect(res.status).toBe(200);
    expect(res.body.apikey).toBeDefined();

    apiKey = res.body.apikey;

    const dbheck = await testPool.query("SELECT * FROM apps WHERE id = $1", [
      appId
    ]);
    console.log('dbcheck***', dbheck.rows[0], userId)
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
      .send({ name: "Test App", id: appId })
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
      .send({ name: "Test App" })
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"id" is required');
  });
});
