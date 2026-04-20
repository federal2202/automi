import express, { Router } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import {prisma} from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { validateSchema, refreshTokenSchema } from '../middleware/validation';



const router: Router = express.Router();

// Google OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Route to initiate Google OAuth flow
router.get('/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
        prompt: 'consent'
    });
    res.redirect(authUrl);
});




router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if(!code){
        return res.status(400).json({ error: 'Authorization code not provided' });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code as string);
        oauth2Client.setCredentials(tokens);
        
        // Get user info from Google
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

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
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        return res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
            }
        })
    } catch (err) {
        console.error('OAuth callback error: ', err);
        return res.status(500).json({ error: "Authorization failed" });
    }
})

// Refresh JWT tokens
router.post('/refresh', validateSchema(refreshTokenSchema), async (req, res): Promise<void> => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
    }
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        
        // Генерируем новые токены
        //зачем при рефреше мы генерируем новый рефреш токен, ведь он же должен быть долгоживущим?
        const newAccessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);
        
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(403).json({ error: 'Invalid refresh token' });
    }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
    // В JWT нет способа "отозвать" токен, поэтому просто возвращаем успех
    // В production можно добавить blacklist токенов
    res.json({ message: 'Logged out successfully' });
});

export default router;