import crypto from "node:crypto";
import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { env, isProd } from "../../config/env.js";
import { ApiError } from "../../lib/errors.js";
import { requireAuth } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rate-limit.js";
import { validateBody } from "../../middleware/validate.js";
import * as auth from "./auth.service.js";
import * as oauth from "./oauth.service.js";
import {
  revokeRefreshToken,
  rotateRefreshToken,
  signAccessToken,
} from "./token.service.js";

const REFRESH_COOKIE = "inkwell_refresh";
const STATE_COOKIE = "inkwell_oauth_state";
const COOKIE_PATH = "/api/v1/auth";

// Mirrors the frontend Zod schemas in lib/validations/auth.ts.
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
const forgotSchema = z.object({ email: z.string().email().toLowerCase() });
const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
}

function readRefreshCookie(req: Request): string {
  const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized("No refresh token");
  return token;
}

export const authRouter = Router();
authRouter.use(authLimiter);

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const { user, accessToken, refreshToken } = await auth.register(req.body);
  setRefreshCookie(res, refreshToken);
  res.status(201).json({ user, accessToken });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const { user, accessToken, refreshToken } = await auth.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ user, accessToken });
});

authRouter.post("/refresh", async (req, res) => {
  const { userId, refreshToken } = await rotateRefreshToken(readRefreshCookie(req));
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken: signAccessToken(userId), user: await auth.getMe(userId) });
});

authRouter.post("/logout", async (req, res) => {
  try {
    await revokeRefreshToken(readRefreshCookie(req));
  } catch {
    // Logging out without a valid cookie is fine.
  }
  clearRefreshCookie(res);
  res.status(204).end();
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: await auth.getMe(req.userId!) });
});

authRouter.post("/forgot-password", validateBody(forgotSchema), async (req, res) => {
  await auth.forgotPassword(req.body.email);
  res.json({ message: "If that account exists, a reset link is on its way." });
});

authRouter.post("/reset-password", validateBody(resetSchema), async (req, res) => {
  await auth.resetPassword(req.body.token, req.body.password);
  res.json({ message: "Password updated. Log in with your new password." });
});

// --- OAuth ---------------------------------------------------------------

authRouter.get("/oauth/:provider", (req, res) => {
  const state = crypto.randomBytes(16).toString("base64url");
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(oauth.buildAuthUrl(req.params.provider!, state));
});

authRouter.get("/oauth/:provider/callback", async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  const expected = (req.cookies as Record<string, string | undefined>)[STATE_COOKIE];
  if (!code || !state || !expected || state !== expected) {
    throw ApiError.unauthorized("OAuth state mismatch");
  }
  res.clearCookie(STATE_COOKIE, { path: COOKIE_PATH });
  const { refreshToken } = await oauth.handleCallback(req.params.provider!, code);
  setRefreshCookie(res, refreshToken);
  // Frontend lands here, then calls /refresh to pick up its access token.
  res.redirect(`${env.FRONTEND_URL}/login?oauth=success`);
});
