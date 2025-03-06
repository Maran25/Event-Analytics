import { NextFunction, Request, Response } from "express";

export const getRequestData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method } = req;

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    res.locals.reqdata = req.body;
  } else {
    res.locals.reqdata = req.query;
  }

  next();
};
