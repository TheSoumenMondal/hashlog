import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authentication token not found. Please login again.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decoded || !decoded.id || !decoded.email) {
      res.status(401).json({
        message: "Invalid token payload.",
      });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next(); // Important!
  } catch (error) {
    res.status(401).json({
      message: "JWT verification failed. Please login again.",
    });
  }
};
