import request from "supertest";
import server from "../../src/index";
import { createEvents } from "../helpers/createEvents";
import { createTestUser } from "../helpers/createTestUser";
import { registerApp } from "../helpers/registerApp";
import { testPool } from "../setupTestDB";

describe("Analytics Route - Event Summary", () => {
  const appId = "test-app-id";
  let token: string;
  let apiKey: string;
  let userid: string;

  beforeAll(async () => {
    const { token: userToken, userid: uid } = await createTestUser();
    token = userToken;
    userid = uid;
    const { apikey } = await registerApp({ id: appId, token });
    apiKey = apikey;
  });
  
  it("Pass -> should return event summary with filters", async () => {
    await createEvents({ userid, appId, eventCount: 5 })
    const res = await request(server)
      .get(`/api/analytics/event-summary?app_id=${appId}&event=login_form_cta_click`)
      .set("Authorization", `Bearer ${token}`)

      console.log('response for summary***', res.body)

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("count");
    expect(res.body).toHaveProperty("uniqueUsers");
    expect(res.body).toHaveProperty("deviceData");
  });

  it("Pass -> should filter event summary by startDate and endDate", async () => {
    const startDate = "2024-02-01T00:00:00Z";
    const endDate = "2024-02-28T23:59:59Z";
  
    await createEvents({
      userid,
      appId,
      eventCount: 5,
      timestamps: [
        "2024-01-15T12:00:00Z", 
        "2024-02-10T14:30:00Z", 
        "2024-02-20T16:45:00Z", 
        "2024-03-01T10:00:00Z", 
        "2024-02-25T09:15:00Z", 
      ],
      eventNames: [
        "login_form_cta_click",
        "login_form_cta_click",
        "login_form_cta_click",
        "signup_form_cta_click",
        "video_played",
      ],
    });
  
    const res = await request(server)
      .get(
        `/api/analytics/event-summary?app_id=${appId}&event=login_form_cta_click&startDate=${startDate}&endDate=${endDate}`
      )
      .set("Authorization", `Bearer ${token}`)
      console.log('what is in the events***', ((await testPool.query('SELECT * FROM events')).rows))
  
    console.log("Filtered event summary response***", res.body);
  
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2); 
  });

  it("Fail -> missing event", async () => {
    const res = await request(server)
      .get(`/api/analytics/event-summary`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"event" is required');
  });

  it("Pass -> should return empty result for non-existing event", async () => {
    await createEvents({ userid, appId, eventCount: 2 })
    const res = await request(server)
      .get(`/api/analytics/event-summary?event=non_existing_event`)
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(0);
    expect(res.body.uniqueUsers).toBe(0);
    expect(res.body.deviceData).toEqual({});
  });
});
