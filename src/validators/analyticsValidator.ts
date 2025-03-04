import Joi from 'joi';

export const collectEventSchema = Joi.object({
  event: Joi.string().min(1).required(),
  url: Joi.string().uri().required(),
  referrer: Joi.string().uri().required(),
  device: Joi.string().required(),
  ipAddress: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required(),
  timestamp: Joi.date().iso().required(),
  metadata: Joi.object({
    browser: Joi.string().required(),
    os: Joi.string().required(),
    screenSize: Joi.string().required(),
  }).required(),
  actor_id: Joi.string().min(3).required(),
});

export const eventSummarySchema = Joi.object({
  event: Joi.string().min(1).required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  app_id: Joi.string().min(3).max(45).optional(),
});

export const userStatsSchema = Joi.object({
  userid: Joi.string().min(3).required(),
});
