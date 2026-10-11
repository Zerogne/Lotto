import { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

// Session cookies are `<expiresAt>.<hmac>` signed with a server-only secret, so
// they can't be forged from the (public) source. Falls back to ADMIN_PASSWORD so
// changing the password also logs out every existing session.
function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  return `${expiresAt}.${await hmac(secret, `admin:${expiresAt}`)}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [expiresAt, sig] = token.split(".");
  if (!expiresAt || !sig || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < Date.now() / 1000) return false;
  return timingSafeEqual(sig, await hmac(secret, `admin:${expiresAt}`));
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

// Compares via HMAC so the check takes the same time regardless of where the
// guess first differs from the real password.
export async function checkAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const key = "admin-password-check";
  return timingSafeEqual(await hmac(key, password), await hmac(key, expected));
}
