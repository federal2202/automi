import jwt from "jsonwebtoken";

export function generateAccessToken(userId: string): string{
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30m' });
}

export function generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
}