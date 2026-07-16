import type { CookieOptions } from "express";

const isProd = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_MAX_AGE = 30 * 60 * 1000; // 30 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Single source of truth for auth-cookie attributes.
 *
 * SameSite:
 *  - production: "none" (+ Secure) so cookies survive a cross-site setup
 *    (frontend on Vercel, API on another domain). "strict"/"lax" would drop
 *    the cookie on cross-site requests — including the EventSource used for SSE.
 *  - development: "lax" because browsers refuse Secure cookies over plain http,
 *    and localhost:3000 ↔ localhost:8000 is same-site anyway.
 *
 * Set and clear MUST use the same attributes or the browser won't match the
 * cookie on logout.
 */
export function cookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}
