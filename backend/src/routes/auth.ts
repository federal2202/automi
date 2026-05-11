import express, { Router } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import {prisma} from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { Logger } from '../middleware/logger';



const router: Router = express.Router();

const REQUIRED_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
];

// Google OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Route to initiate Google OAuth flow
router.get('/google', (_req, res) => {
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
            return res.redirect('http://localhost:3000/auth/callback?error=missing_scopes');
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
        const refreshToken = generateRefreshToken(user.id);

        Logger.info('OAuth flow completed successfully', {
            userId: user.id,
            email: user.email,
            hasJWTTokens: !!(accessToken && refreshToken)
        });

        // Set httpOnly cookies for tokens
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000 // 30 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        Logger.info('Secure cookies set', {
            userId: user.id,
            cookiesSet: ['accessToken', 'refreshToken']
        });

        // Pass user data via URL (not sensitive, can be in URL)
        const userData = { id: user.id, email: user.email, name: user.name, picture: user.picture };
        const encodedUser = encodeURIComponent(JSON.stringify(userData));
        return res.redirect(`http://localhost:3000/auth/callback?user=${encodedUser}`);
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
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        
        Logger.database('User.findUnique', 'Finding user for token refresh', { userId: decoded.userId });
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user) {
            Logger.error('User not found during token refresh', { userId: decoded.userId });
            res.status(401).json({ error: 'User not found' });
            return;
        }
        
        Logger.debug('Generating new JWT tokens for user', { userId: user.id });
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        
        // Set new httpOnly cookies for tokens
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 60 * 1000 // 30 minutes
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
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
            }
        });
    } catch (error) {
        Logger.error('Invalid access token during user check', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Logout endpoint
router.post('/logout', async (_req, res) => {
    // Clear httpOnly cookies
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    Logger.info('User logged out and cookies cleared');
    res.json({ message: 'Logged out successfully' });
});

export default router;