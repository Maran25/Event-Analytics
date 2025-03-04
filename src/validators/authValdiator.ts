import Joi from 'joi';

export const registerAppSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  id: Joi.string().min(3).max(45).required(),
  // userid: Joi.string().min(3).max(45).required(),
});

export const getApiKeySchema = Joi.object({
  id: Joi.string().min(3).max(45).required(),
});

export const revokeApiKeySchema = Joi.object({
  apikey: Joi.string().hex().length(64).required(),
});
