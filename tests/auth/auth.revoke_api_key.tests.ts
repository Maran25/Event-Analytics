import request from "supertest";
import server from "../../src/index";
import { createTestUser } from "../helpers/createTestUser";
import { registerApp } from "../helpers/registerApp";
import { testPool } from "../setupTestDB";

describe("Auth Route - Revoke Api Key", () => {
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

  it("Pass -> should get the API key for a registered app", async () => {
    const res = await request(server)
      .get(`/api/auth/api-key?id=${appId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.apikey).toBe(apiKey);
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
    console.log("response for the first**", res.body);

    expect(res.status).toBe(200);
    expect(res.body.apikey).toBe(apiKey);
  });

  it("Pass -> app does not exists in the db", async () => {
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
