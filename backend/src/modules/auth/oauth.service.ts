import { env } from "../../config/env.js";
import { ApiError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthProvider } from "@prisma/client";
import { issueSession } from "./auth.service.js";

type Provider = "google" | "github";

type OAuthProfile = {
  providerId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

const providers: Record<
  Provider,
  {
    enabled: () => boolean;
    authUrl: (redirectUri: string, state: string) => string;
    fetchProfile: (code: string, redirectUri: string) => Promise<OAuthProfile>;
  }
> = {
  google: {
    enabled: () => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    authUrl: (redirectUri, state) =>
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state,
      }),
    async fetchProfile(code, redirectUri) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      if (!tokenRes.ok) throw ApiError.unauthorized("Google token exchange failed");
      const { access_token } = (await tokenRes.json()) as { access_token: string };
      const profileRes = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      if (!profileRes.ok) throw ApiError.unauthorized("Google profile fetch failed");
      const p = (await profileRes.json()) as {
        id: string;
        email: string;
        name?: string;
        picture?: string;
      };
      return {
        providerId: p.id,
        email: p.email,
        name: p.name ?? p.email.split("@")[0]!,
        avatarUrl: p.picture ?? null,
      };
    },
  },
  github: {
    enabled: () => !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    authUrl: (redirectUri, state) =>
      "https://github.com/login/oauth/authorize?" +
      new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID!,
        redirect_uri: redirectUri,
        scope: "read:user user:email",
        state,
      }),
    async fetchProfile(code, redirectUri) {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          code,
          client_id: env.GITHUB_CLIENT_ID!,
          client_secret: env.GITHUB_CLIENT_SECRET!,
          redirect_uri: redirectUri,
        }),
      });
      if (!tokenRes.ok) throw ApiError.unauthorized("GitHub token exchange failed");
      const { access_token } = (await tokenRes.json()) as { access_token: string };
      const headers = {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      };
      const profileRes = await fetch("https://api.github.com/user", { headers });
      if (!profileRes.ok) throw ApiError.unauthorized("GitHub profile fetch failed");
      const p = (await profileRes.json()) as {
        id: number;
        login: string;
        name: string | null;
        email: string | null;
        avatar_url: string | null;
      };
      let email = p.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
        if (emailsRes.ok) {
          const emails = (await emailsRes.json()) as Array<{
            email: string;
            primary: boolean;
            verified: boolean;
          }>;
          email =
            emails.find((e) => e.primary && e.verified)?.email ??
            emails.find((e) => e.verified)?.email ??
            null;
        }
      }
      if (!email) throw ApiError.badRequest("GitHub account has no verified email");
      return {
        providerId: String(p.id),
        email,
        name: p.name ?? p.login,
        avatarUrl: p.avatar_url,
      };
    },
  },
};

function getProvider(name: string) {
  const provider = providers[name as Provider];
  if (!provider) throw ApiError.badRequest(`Unknown OAuth provider: ${name}`);
  if (!provider.enabled()) {
    throw ApiError.notImplemented(
      `${name} OAuth is not configured on this server (missing client credentials)`
    );
  }
  return provider;
}

export function buildAuthUrl(name: string, state: string): string {
  return getProvider(name).authUrl(`${env.OAUTH_REDIRECT_BASE}/${name}/callback`, state);
}

export async function handleCallback(name: string, code: string) {
  const provider = getProvider(name);
  const profile = await provider.fetchProfile(
    code,
    `${env.OAUTH_REDIRECT_BASE}/${name}/callback`
  );
  const providerEnum = name.toUpperCase() as AuthProvider;

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: {
      // Link the provider on first OAuth login for an existing local account.
      provider: providerEnum,
      providerId: profile.providerId,
      avatarUrl: profile.avatarUrl ?? undefined,
    },
    create: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      provider: providerEnum,
      providerId: profile.providerId,
      settings: { create: {} },
    },
  });
  return issueSession(user.id);
}
