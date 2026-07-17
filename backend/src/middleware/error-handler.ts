import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { isProd } from "../config/env.js";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }
  logger.error(err, "Unhandled error");
  res.status(500).json({
    error: {
      code: "INTERNAL",
      message: isProd ? "Something went wrong" : String(err),
    },
  });
}
