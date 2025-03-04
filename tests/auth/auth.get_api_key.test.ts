import request from "supertest";
import server from "../../src/index";
import { createTestUser } from "../helpers/createTestUser";
import { registerApp } from "../helpers/registerApp";

describe("Auth Route - Get Api Key", () => {
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

    console.log("response for the first**", res.body);

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
