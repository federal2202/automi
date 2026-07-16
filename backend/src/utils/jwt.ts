import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string): string{
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30m' });
}

// tokenVersion is embedded so /auth/refresh can reject a refresh token issued
// before the user's last logout, even though the JWT signature itself is
// still valid for up to 7 days (see User.tokenVersion).
export function generateRefreshToken(userId: string, tokenVersion: number): string {
    return jwt.sign({ userId, tokenVersion }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}