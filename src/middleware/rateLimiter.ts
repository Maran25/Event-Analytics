import rateLimit from "express-rate-limit";
import { Request } from "express";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 500, 
  keyGenerator: (req: Request) => {
    return (req.headers['x-api-key'] as string) || req.ip || 'unknown';
  },
  message: 'Rate limit exceeded. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
