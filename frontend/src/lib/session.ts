// Mock session layer for the UI phases. Phase 7 replaces this with real
// JWT auth; the cookie is what lets Next.js middleware guard routes today.

export const SESSION_COOKIE = "inkwell_session";
const USER_KEY = "inkwell.user";

export type SessionUser = {
  name: string;
  email: string;
};

export function setSession(user: SessionUser) {
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem(USER_KEY);
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
