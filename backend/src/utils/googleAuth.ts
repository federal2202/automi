import { google, Auth } from "googleapis";
import { User } from "@prisma/client";
import {prisma} from '../lib/prisma';
import { Logger } from '../middleware/logger';

export function createGoogleAuthClient(user: User): Auth.OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken
    });

    return oauth2Client;
}

// Auto-refresh tokens when expired
export async function createCalendarClient(user: User) {
    const oauth2Client = createGoogleAuthClient(user);
    
    // Check for token expiration
    const now = new Date();
    Logger.debug('Checking Google token expiration', {
        userId: user.id,
        expiresAt: user.expiresAt,
        isExpired: user.expiresAt <= now
    });
    
    if (user.expiresAt <= now) {
        try {
            Logger.info('Google token expired, refreshing automatically', { userId: user.id });
            
            // Refresh tokens automatically
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            
            Logger.apiCall('Google', 'refreshAccessToken', {
                userId: user.id,
                hasNewToken: !!credentials.access_token,
                newExpiryDate: credentials.expiry_date
            });
            
            // Save new tokens to database
            Logger.database('User.update', 'Updating user with refreshed Google tokens', {
                userId: user.id,
                newExpiresAt: new Date(credentials.expiry_date!)
            });
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    accessToken: credentials.access_token!,
                    expiresAt: new Date(credentials.expiry_date!)
                }
            });
            
            Logger.info('Google tokens refreshed successfully', { userId: user.id });
        } catch (error) {
            Logger.error('Failed to refresh Google token', { userId: user.id, error });
            throw new Error('Google token refresh failed');
        }
    }
    
    return google.calendar({ version: 'v3', auth: oauth2Client });
}