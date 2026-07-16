import express, { Router } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import {prisma} from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { cookieOptions, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from '../utils/cookies';
import { Logger } from '../middleware/logger';



const router: Router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
];

/**
 * Build a fresh OAuth2 client per request. A single shared client is mutable —
 * getToken()/setCredentials() write onto it — so two concurrent logins could
 * cross each other's tokens. A new client per request has no shared state.
 */
function createOAuthClient() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

// Route to initiate Google OAuth flow
router.get('/google', (_req, res) => {
    const oauth2Client = createOAuthClient();
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: REQUIRED_SCOPES,
        prompt: 'consent',
        include_granted_scopes: true,
    });

    Logger.info('Google OAuth flow initiated', {
        authUrl: authUrl.substring(0, 50) + '...',
        scopes: REQUIRED_SCOPES
    });

    res.redirect(authUrl);
});




router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    Logger.info('Google OAuth callback received', {
        hasCode: !!code,
        query: Object.keys(req.query)
    });

    if(!code){
        Logger.error('OAuth callback: Authorization code not provided');
        return res.status(400).json({ error: 'Authorization code not provided' });
    }

    try {
        const oauth2Client = createOAuthClient();

        Logger.debug('Exchanging authorization code for tokens');
        const { tokens } = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);

        Logger.apiCall('Google', 'getToken', {
            hasAccessToken: !!tokens.access_token,
            hasRefreshToken: !!tokens.refresh_token,
            expiresAt: tokens.expiry_date
        });

        const grantedScopes = (tokens.scope ?? '').split(' ');
        const missingScopes = REQUIRED_SCOPES.filter(s => !grantedScopes.includes(s));
        if (missingScopes.length > 0) {
            Logger.error('OAuth callback: token is missing required scopes', { missingScopes });
            return res.redirect(`${FRONTEND_URL}/auth/callback?error=missing_scopes`);
        }

        // Get user info from Google
        Logger.debug('Fetching user info from Google');
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        Logger.apiCall('Google', 'userinfo.get', {
            userId: userInfo.data.id,
            email: userInfo.data.email,
            name: userInfo.data.name
        });

        Logger.database('User.upsert', 'Upserting user with Google credentials', {
            googleId: userInfo.data.id,
            email: userInfo.data.email
        });

        const user = await prisma.user.upsert({
            where: { googleId: userInfo.data.id! },
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token || undefined,
                expiresAt: new Date(tokens.expiry_date!),
                scope: tokens.scope!
            },
            create: {
                googleId: userInfo.data.id!,
                email: userInfo.data.email!,
                name: userInfo.data.name!,
                picture: userInfo.data.picture,
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiresAt: new Date(tokens.expiry_date!),
                scope: tokens.scope!
            }
        })

        Logger.debug('Generating JWT tokens', { userId: user.id });
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

        Logger.info('OAuth flow completed successfully', {
            userId: user.id,
            email: user.email,
            hasJWTTokens: !!(accessToken && refreshToken)
        });

        // Set httpOnly cookies for tokens
        res.cookie('accessToken', accessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refreshToken', refreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));

        Logger.info('Secure cookies set', {
            userId: user.id,
            cookiesSet: ['accessToken', 'refreshToken']
        });

        // Pass user data via URL (not sensitive, can be in URL)
        const userData = { id: user.id, email: user.email, name: user.name, picture: user.picture };
        const encodedUser = encodeURIComponent(JSON.stringify(userData));
        return res.redirect(`${FRONTEND_URL}/auth/callback?user=${encodedUser}`);
    } catch (err) {
        Logger.error('OAuth callback error', err);
        return res.status(500).json({ error: "Authorization failed" });
    }
})

// Refresh JWT tokens
router.post('/refresh', async (req, res): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    Logger.debug('JWT token refresh requested', { hasRefreshToken: !!refreshToken });

    if (!refreshToken) {
        Logger.error('Refresh token not provided in cookies');
        res.status(401).json({ error: 'Refresh token required' });
        return;
    }

    try {
        Logger.debug('Verifying refresh token');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string; tokenVersion?: number };

        Logger.database('User.findUnique', 'Finding user for token refresh', { userId: decoded.userId });
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            Logger.error('User not found during token refresh', { userId: decoded.userId });
            res.status(401).json({ error: 'User not found' });
            return;
        }

        // Tokens issued before this field existed carry no tokenVersion claim
        // (undefined); treat that the same as version 0 so already-issued
        // refresh tokens aren't invalidated by this rollout.
        if ((decoded.tokenVersion ?? 0) !== user.tokenVersion) {
            Logger.error('Refresh token revoked (tokenVersion mismatch)', { userId: user.id });
            res.status(403).json({ error: 'Invalid refresh token' });
            return;
        }

        Logger.debug('Generating new JWT tokens for user', { userId: user.id });
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id, user.tokenVersion);

        // Set new httpOnly cookies for tokens
        res.cookie('accessToken', newAccessToken, cookieOptions(ACCESS_TOKEN_MAX_AGE));
        res.cookie('refreshToken', newRefreshToken, cookieOptions(REFRESH_TOKEN_MAX_AGE));

        Logger.info('JWT tokens refreshed successfully', { userId: user.id });

        res.json({ message: 'Tokens refreshed successfully' });
    } catch (error) {
        Logger.error('Refresh token error', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

// Get current authenticated user
router.get('/user', async (req, res): Promise<void> => {
    try {
        // Extract token from httpOnly cookies
        const accessToken = req.cookies.accessToken;

        Logger.debug('Get user endpoint called', { hasAccessToken: !!accessToken });

        if (!accessToken) {
            Logger.debug('No access token provided');
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        // Verify JWT token
        Logger.debug('Verifying access token');
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as { userId: string };

        // Fetch user from database
        Logger.database('User.findUnique', 'Finding user for authentication check', { userId: decoded.userId });
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            Logger.error('User not found during authentication check', { userId: decoded.userId });
            res.status(401).json({ error: 'User not found' });
            return;
        }

        Logger.info('User authentication check successful', {
            userId: user.id,
            email: user.email
        });

        // Return user data
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null,
            }
        });
    } catch (error) {
        Logger.error('Invalid access token during user check', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    // Best-effort revocation: bump tokenVersion so the refresh token this
    // session was using stops working even though its 7-day JWT signature is
    // still otherwise valid (there's no separate token-blacklist store here).
    // If the cookie is missing/invalid there's nothing to revoke — clearing
    // cookies below is still a successful logout from the client's view.
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { tokenVersion: { increment: 1 } },
            });
            Logger.info('Refresh token revoked on logout', { userId: decoded.userId });
        } catch (error) {
            Logger.debug('Logout: no valid refresh token to revoke', { error });
        }
    }

    // Clear httpOnly cookies — same attributes as when they were set.
    res.clearCookie('accessToken', cookieOptions());
    res.clearCookie('refreshToken', cookieOptions());

    Logger.info('User logged out and cookies cleared');
    res.json({ message: 'Logged out successfully' });
});

export default router;
