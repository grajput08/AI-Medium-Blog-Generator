import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { isProd } from "../config/env.js";

export const logger = pino({
  level: isProd ? "info" : "debug",
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === "/api/v1/health",
  },
  redact: ["req.headers.authorization", "req.headers.cookie"],
});
