import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('before the token')
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('after the token', token)

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return 
  }

  try {
    console.log("dfdfdfdfd***", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("decoddrd***", decoded, token);
    res.locals.userData = decoded;
    next();
  } catch (err) {
    console.log("errodecoddrd***", err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};