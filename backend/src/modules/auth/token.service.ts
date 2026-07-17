import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../lib/errors.js";

const REFRESH_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

function hash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): string {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof payload === "string" || !payload.sub) throw new Error("bad payload");
    return payload.sub;
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(48).toString("base64url");
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hash(raw),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return raw;
}

/**
 * Rotation: the presented token is revoked and a fresh one issued.
 * A revoked-token reuse means theft — revoke the whole family for safety.
 */
export async function rotateRefreshToken(
  raw: string
): Promise<{ userId: string; refreshToken: string }> {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hash(raw) },
  });
  if (!record) throw ApiError.unauthorized("Unknown refresh token");
  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw ApiError.unauthorized("Refresh token reuse detected — all sessions revoked");
  }
  if (record.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token expired");
  }
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });
  const refreshToken = await issueRefreshToken(record.userId);
  return { userId: record.userId, refreshToken };
}

export async function revokeRefreshToken(raw: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hash(raw), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function hashToken(token: string): string {
  return hash(token);
}
