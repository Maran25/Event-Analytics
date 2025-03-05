import request from "supertest";
import app from "../src/app";
import server from "../src/index";
import { createTestUser } from "./helpers/createTestUser";
import { registerApp } from "./helpers/registerApp";
import { createEvents } from "./helpers/createEvents";

describe("Analytics Routes", () => {
  const appId = "test-app-id";
  const eventuser = "eventuser123";
  let token: string;
  let apiKey: string;
  let userid: string;

  beforeAll(async () => {
    const { token: userToken, userid: uid } = await createTestUser();
    token = userToken;
    userid = uid;
    const { apikey } = await registerApp({ id: appId, token });
    apiKey = apikey;
    await createEvents({ userid, appId, eventCount: 5 });
  });

  describe("Collect Event", () => {
    it("Pass -> should collect an event successfully", async () => {
      const eventData = {
        event: "login_form_cta_click",
        url: "https://example.com/page",
        referrer: "https://google.com",
        device: "mobile",
        ipAddress: "192.168.1.1",
        timestamp: "2024-02-20T12:34:56Z",
        metadata: { browser: "Chrome", os: "Android", screenSize: "1080x1920" },
        userId: "abc123",
      };

      const res = await request(app)
        .post("/api/analytics/collect")
        .set("Authorization", `Bearer ${token}`)
        .set("x-api-key", apiKey)
        .send(eventData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Event collected successfully");
    });

    it("Fail -> should return 400 if required fields are missing", async () => {
      const incompleteEventData = { event: "login_form_cta_click", url: "https://example.com/page" };
      const res = await request(app)
        .post("/api/analytics/collect")
        .set("Authorization", `Bearer ${token}`)
        .set("x-api-key", apiKey)
        .send(incompleteEventData);

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('"ipAddress" is required');
    });
  });

  describe("Event Summary", () => {
    it("Pass -> should return event summary with filters", async () => {
      const res = await request(server)
        .get(`/api/analytics/event-summary?app_id=${appId}&event=login_form_cta_click`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(res.body).toHaveProperty("uniqueUsers");
      expect(res.body).toHaveProperty("deviceData");
    });

    it("Fail -> missing event", async () => {
      const res = await request(server)
        .get(`/api/analytics/event-summary`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('"event" is required');
    });
  });

  describe("User Stats", () => {
    it("Pass -> should return user stats", async () => {
      await createEvents({ userid, appId, eventCount: 3, eventUser: [eventuser, eventuser, eventuser] });
      const res = await request(server)
        .get(`/api/analytics/user-stats?userid=${eventuser}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("userId", eventuser);
      expect(res.body).toHaveProperty("totalEvents", 3);
    });

    it("Fail -> should return 400 for missing userid", async () => {
      const res = await request(server)
        .get(`/api/analytics/user-stats`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.errors).toContain('"userid" is required');
    });
  });
});
