import { testPool } from "../setupTestDB";

const randomEvents = [
  "login_form_cta_click",
  "signup_form_cta_click",
  // "page_view",
  // "add_to_cart",
  // "purchase_complete",
  // "scroll_depth_reached",
  "video_played",
];

export const createEvents = async ({
  userid,
  appId,
  eventCount = 5,
  timestamps = [],
  eventNames = [],
  eventUser = []
}: {
  userid: string;
  appId: string;
  eventCount?: number;
  timestamps?: string[];
  eventNames?: string[];
  eventUser?: string[];
}) => {
  for (let i = 0; i < eventCount; i++) {
    const eventData = {
      event: eventNames[i] || randomEvents[Math.floor(Math.random() * randomEvents.length)],
      url: `https://example.com/page-${i + 1}`,
      referrer: i % 2 === 0 ? "https://google.com" : "https://facebook.com",
      device: i % 2 === 0 ? "mobile" : "desktop",
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      timestamp: timestamps[i] || new Date().toISOString(),
      metadata: {
        browser: i % 2 === 0 ? "Chrome" : "Firefox",
        os: i % 2 === 0 ? "Android" : "Windows",
        screenSize: i % 2 === 0 ? "1080x1920" : "1440x900",
      },
      userId: eventUser[i] || `testuser${Math.floor(Math.random() * 1000)}`,
    };

    await testPool.query(
      `INSERT INTO events (
        app_id, user_id, actor_id, event, url, referrer, device, ip_address, timestamp, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        appId,
        userid,
        eventData.userId,
        eventData.event,
        eventData.url,
        eventData.referrer,
        eventData.device,
        eventData.ipAddress,
        eventData.timestamp,
        JSON.stringify(eventData.metadata),
      ]
    );
  }

  console.log(`Collected ${eventCount} random events.`);
};
