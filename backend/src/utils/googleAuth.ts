import { google, Auth } from "googleapis";
import { User } from "@prisma/client";
import {prisma} from '../lib/prisma';

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

// Автообновление токенов при истечении
export async function createCalendarClient(user: User) {
    const oauth2Client = createGoogleAuthClient(user);
    
    // Проверяем истечение токена
    const now = new Date();
    if (user.expiresAt <= now) {
        try {
            // Обновляем токены автоматически
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            
            // Сохраняем новые токены в БД
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    accessToken: credentials.access_token!,
                    expiresAt: new Date(credentials.expiry_date!)
                }
            });
            
            console.log('Google tokens refreshed for user:', user.id);
        } catch (error) {
            console.error('Failed to refresh Google token:', error);
            throw new Error('Google token refresh failed');
        }
    }
    
    return google.calendar({ version: 'v3', auth: oauth2Client });
}