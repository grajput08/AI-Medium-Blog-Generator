import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOrigins } from "./config/env.js";
import { httpLogger } from "./lib/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { globalLimiter } from "./middleware/rate-limit.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      // API only — a strict CSP still guards any error page the server renders.
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
    })
  );
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());
  app.use(httpLogger);
  app.use(globalLimiter);

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
