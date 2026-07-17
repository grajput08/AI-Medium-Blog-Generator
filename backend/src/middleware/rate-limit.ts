import { rateLimit } from "express-rate-limit";

const standardOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: { code: "RATE_LIMITED", message: "Too many requests, slow down." },
  },
} as const;

/** Global guard: generous, per IP. */
export const globalLimiter = rateLimit({
  ...standardOptions,
  windowMs: 60_000,
  limit: 300,
});

/** Auth endpoints: brute-force protection. */
export const authLimiter = rateLimit({
  ...standardOptions,
  windowMs: 15 * 60_000,
  limit: 20,
});

/** AI endpoints (Phase 6): expensive, per user where possible. */
export const aiLimiter = rateLimit({
  ...standardOptions,
  windowMs: 60_000,
  limit: 10,
  keyGenerator: (req) => (req as { userId?: string }).userId ?? req.ip ?? "anon",
});
