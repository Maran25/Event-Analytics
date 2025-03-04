import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.locals.userData = decoded;
    next();
  } catch (err) {
    console.log("errodecoddrd***", err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};