import { Request, Response } from "express";
import { AnalyticsService } from "../services/AnalyticsServices";

const analyticsService = new AnalyticsService();

export const collectEvent = async (req: Request, res: Response) => {
  const { appData, reqdata } = res.locals;
  const { id: app_id, userid: user_id } = appData;
  const {
    event,
    url,
    referrer,
    device,
    ipAddress,
    timestamp,
    metadata,
    actor_id,
  } = reqdata;

  try {
    await analyticsService.collectEvent({
      app_id,
      user_id,
      actor_id,
      event,
      url,
      referrer,
      device,
      ipAddress,
      timestamp,
      metadata,
    });

    res.status(200).json({ message: "Event collected successfully" });
  } catch (error: any) {
    console.error("Collect event error:", error.message);
    res.status(500).json({ message: "Error collecting event" });
  }
};

export const eventSummary = async (req: Request, res: Response) => {
  const { event, startDate, endDate, app_id } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    const summary = await analyticsService.getEventSummary(
      event,
      startDate,
      endDate,
      app_id,
      user_id
    );

    res.status(200).json(summary);
  } catch (error: any) {
    console.error("Event summary error:", error.message);
    res.status(500).json({ error: "Failed to fetch event summary" });
  }
};

export const userStats = async (req: Request, res: Response) => {
  const { userid } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    const stats = await analyticsService.getUserStats(userid, user_id);
    if (!stats) {
      res.status(404).json({ message: "User not found" });
      return 
    }
    res.status(200).json(stats);
  } catch (error: any) {
    console.error("User stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
