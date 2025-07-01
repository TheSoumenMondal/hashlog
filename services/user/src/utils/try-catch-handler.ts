import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const Trycatch = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
};
