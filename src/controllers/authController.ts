import { Request, Response } from "express";
import { AuthService } from "../services/AuthServices";

const authService = new AuthService();

export const registerApp = async (_: Request, res: Response) => {
  const { name, id } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    if (await authService.appExists(id)) {
      res.status(400).json({ message: "App already exists" });
      return 
    }
    
    const apikey = await authService.registerApp(name, id, user_id);
    res.status(200).json({ apikey });
  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Error registering app" });
  }
};

export const getApiKey = async (_: Request, res: Response) => {
  const { id } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    const apikey = await authService.getApiKey(id, user_id);
    if (!apikey) {
      res.status(404).json({ message: "App not found" });
      return 
    }

    res.status(200).json({ apikey });
  } catch (error: any) {
    console.error("Get API key error:", error.message);
    res.status(500).json({ message: "Error getting API key" });
  }
};

export const revokeApiKey = async (_: Request, res: Response) => {
  const { apikey } = res.locals.reqdata;
  const { user_id } = res.locals.userData;

  try {
    await authService.revokeApiKey(apikey, user_id);
    res.status(200).json({ message: "API Key revoked" });
  } catch (error: any) {
    console.error("Revoke API key error:", error.message);
    res.status(500).json({ message: "Error revoking API Key" });
  }
};
