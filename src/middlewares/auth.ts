import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env';
import { container } from 'tsyringe';
import { TokenBlacklistService } from '../services/TokenBlacklistService';

export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization?.split(' ') || [];

  if (authHeader.length !== 2 || authHeader[0].toLowerCase() !== 'bearer') {
    res.status(401).json({ status: 'error', message: 'Invalid authorization header' });
    return;
  }

  const token = authHeader[1];

  try {
    // Verificar si el token está en la blacklist
    const tokenBlacklist = container.resolve(TokenBlacklistService);
    if (await tokenBlacklist.isBlacklisted(token)) {
      throw new Error('Token has been invalidated');
    }
    
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };
    
    // Adjuntar información del usuario a la solicitud
    (req as any).userId = payload.sub;
    (req as any).role = payload.role;
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(401).json({ 
      status: 'error', 
      message: 'Invalid or expired token', 
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
}
