import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  bio: string;
  image: string;
  instagram: string;
  linkedin: string;
  github: string;
  facebook: string;
  youtube: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
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
    ) as IUser;

    if (!decoded) {
      res.status(401).json({
        message: "Invalid token payload.",
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "JWT verification failed. Please login again.",
    });
  }
};
