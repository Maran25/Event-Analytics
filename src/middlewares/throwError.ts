import { NextFunction } from 'express';

export const throwError = (message: string, statusCode: number, next: NextFunction) => {
  const error = new Error(message) as any;
  error.statusCode = statusCode;
  next(error);
};
