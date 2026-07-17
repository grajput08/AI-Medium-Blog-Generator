import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { env } from "../../config/env.js";
import {
  hashToken,
  issueRefreshToken,
  revokeAllForUser,
  signAccessToken,
} from "./token.service.js";

const BCRYPT_ROUNDS = 12;
const RESET_TTL_MS = 30 * 60 * 1000;

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

function toPublic(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}): PublicUser {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
}

async function issueSession(userId: string) {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: await issueRefreshToken(userId),
  };
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
      settings: { create: {} },
    },
  });
  return { user: toPublic(user), ...(await issueSession(user.id)) };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Same error for unknown email and wrong password — no account enumeration.
  const invalid = ApiError.unauthorized("Invalid email or password");
  if (!user?.passwordHash) throw invalid;
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw invalid;
  return { user: toPublic(user), ...(await issueSession(user.id)) };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.unauthorized();
  return toPublic(user);
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always succeed from the caller's perspective — no account enumeration.
  if (!user) return;

  const raw = crypto.randomBytes(32).toString("base64url");
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    },
  });
  // Mailer lands with deployment config; until then the link is logged.
  logger.info(
    { resetUrl: `${env.FRONTEND_URL}/reset-password?token=${raw}` },
    "Password reset link (mailer not configured)"
  );
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest("Reset link is invalid or has expired");
  }
  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
    }),
  ]);
  // New password invalidates every open session.
  await revokeAllForUser(record.userId);
}

export { issueSession };
