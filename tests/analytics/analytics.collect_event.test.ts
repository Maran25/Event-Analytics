import request from "supertest";
import app from "../../src/app";
import { createTestUser } from "../helpers/createTestUser";
import { registerApp } from "../helpers/registerApp";

describe("Analytics Route - Collect Event", () => {
  const appId = "test-app-id";
  let token: string;
  let apiKey: string;

  beforeAll(async () => {
    const { token: userToken } = await createTestUser();
    token = userToken;
    const { apikey } = await registerApp({ id: appId, token });
    apiKey = apikey;
  });

  it("Pass -> should collect an event successfully", async () => {
    const eventData = {
      event: "login_form_cta_click",
      url: "https://example.com/page",
      referrer: "https://google.com",
      device: "mobile",
      ipAddress: "192.168.1.1",
      timestamp: "2024-02-20T12:34:56Z",
      metadata: {
        browser: "Chrome",
        os: "Android",
        screenSize: "1080x1920",
      },
      userId: "abc123",
    };

    const res = await request(app)
      .post("/api/analytics/collect")
      .set("Authorization", `Bearer ${token}`)
      .set("x-api-key", apiKey)
      .send(eventData);

      console.log('responese***', res.body)

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Event collected successfully");
  });

  it("Fail -> should return 400 if required fields are missing", async () => {
    const incompleteEventData = {
      event: "login_form_cta_click",
      url: "https://example.com/page",
    };

    const res = await request(app)
      .post("/api/analytics/collect")
      .set("Authorization", `Bearer ${token}`)
      .set("x-api-key", apiKey)
      .send(incompleteEventData);

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('\"ipAddress\" is required');
  });

  it("Fail -> should return 401 if API key is missing", async () => {
    const eventData = {
      event: "login_form_cta_click",
      url: "https://example.com/page",
      referrer: "https://google.com",
      device: "mobile",
      ipAddress: "192.168.1.1",
      timestamp: "2024-02-20T12:34:56Z",
      metadata: {
        browser: "Chrome",
        os: "Android",
        screenSize: "1080x1920",
      },
      userId: "abc123",
    };

    const res = await request(app)
      .post("/api/analytics/collect")
      .set("Authorization", `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("API key is required");
  });

  it("Fail -> should return 403 if user is unauthorized", async () => {
    const eventData = {
      event: "login_form_cta_click",
      url: "https://example.com/page",
      referrer: "https://google.com",
      device: "mobile",
      ipAddress: "192.168.1.1",
      timestamp: "2024-02-20T12:34:56Z",
      metadata: {
        browser: "Chrome",
        os: "Android",
        screenSize: "1080x1920",
      },
      userId: "abc123",
    };

    const res = await request(app)
      .post("/api/analytics/collect")
      .set("x-api-key", apiKey)
      .send(eventData);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Access denied. No token provided.");
  });
});
