import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import {prisma} from "../lib/prisma";
import { AuthRequest } from "../types/auth";

interface JWTPayload {
    userId: string;
    iat: number;
    exp: number;
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //bearer token -> token

    if(!token){
        return res.status(401).json({ error: 'No token provided' });

    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        })
        if(!user){
            return res.status(401).json({ error: 'user not found' });
        }
        req.user = user;
        return next();
        
    } catch(err){
        return res.status(403).json({ error: "Invalid token"})
    }
}