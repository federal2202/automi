/**
 * google-calendar.ts
 *
 * Factory that returns an authenticated Google Calendar v3 events resource
 * for a given user. Handles access-token refresh transparently via the
 * googleapis library's built-in refreshHandler mechanism.
 *
 * Centralised here so no controller or service needs to know about
 * OAuth2Client construction details.
 */

import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";
import { prisma } from "./prisma";

/**
 * Builds an OAuth2Client pre-loaded with the user's stored credentials and
 * wires a token-refresh listener that persists the new access token back to
 * the database automatically.
 */
export function buildCalendarClient(user: {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}): calendar_v3.Resource$Events {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
    expiry_date: user.expiresAt.getTime(),
  });

  // Persist refreshed tokens back to DB so subsequent requests don't need to
  // re-fetch them from Google.
  oauth2Client.on("tokens", async (tokens) => {
    try {
      const update: { accessToken?: string; expiresAt?: Date; refreshToken?: string } = {};
      if (tokens.access_token) update.accessToken = tokens.access_token;
      if (tokens.expiry_date) update.expiresAt = new Date(tokens.expiry_date);
      if (tokens.refresh_token) update.refreshToken = tokens.refresh_token;

      if (Object.keys(update).length > 0) {
        await prisma.user.update({ where: { id: user.id }, data: update });
      }
    } catch (err) {
      console.error("[google-calendar] Failed to persist refreshed tokens:", err);
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  return calendar.events;
}
