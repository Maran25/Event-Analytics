import request from "supertest";
import server from "../../src/index";
import { createEvents } from "../helpers/createEvents";
import { createTestUser } from "../helpers/createTestUser";
import { registerApp } from "../helpers/registerApp";

describe("Analytics Route - User Stats", () => {
  const appId = "test-app-id";
  const eventuser = 'eventuser123'
  let token: string;
  let userid: string;

  beforeAll(async () => {
    const { token: userToken, userid: uid } = await createTestUser();
    token = userToken;
    userid = uid;
    await registerApp({ id: appId, token })
  });

  it("Pass -> should return user stats", async () => {
    await createEvents({
      userid,
      appId,
      eventCount: 3,
      eventUser: [eventuser, eventuser, eventuser]
    });

    const res = await request(server)
      .get(`/api/analytics/user-stats?userid=${eventuser}`)
      .set("Authorization", `Bearer ${token}`);

    console.log("User stats response***", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("userId", eventuser);
    expect(res.body).toHaveProperty("totalEvents");
    expect(res.body.totalEvents).toBe(3)
    expect(res.body.deviceDetails).toHaveProperty("browser");
    expect(res.body.deviceDetails).toHaveProperty("os");
    expect(res.body).toHaveProperty("ipAddress");
  });

  it("Pass -> should return cached user stats", async () => {
    const res = await request(server)
      .get(`/api/analytics/user-stats?userid=${eventuser}`)
      .set("Authorization", `Bearer ${token}`);

    console.log("Cached user stats response***", res.body);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("userId", eventuser);
  });

  it("Fail -> should return 404 if no user stats are found", async () => {
    const res = await request(server)
      .get(`/api/analytics/user-stats?userid=nonexistentuser`)
      .set("Authorization", `Bearer ${token}`);

      console.log('3th test***', res.body)
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "User not found" });
  });

  it("Fail -> should return 400 for missing userid", async () => {
    const res = await request(server)
      .get(`/api/analytics/user-stats`)
      .set("Authorization", `Bearer ${token}`);
      console.log('4th test***', res.body)

    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('"userid" is required');
  });
});
