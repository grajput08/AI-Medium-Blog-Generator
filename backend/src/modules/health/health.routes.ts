import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database = "up";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "down";
  }
  const healthy = database === "up";
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    database,
    uptime: Math.round(process.uptime()),
  });
});
