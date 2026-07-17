import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/errors.js";
import { verifyAccessToken } from "../modules/auth/token.service.js";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(ApiError.unauthorized());
    return;
  }
  req.userId = verifyAccessToken(header.slice("Bearer ".length));
  next();
}
