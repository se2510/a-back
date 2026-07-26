import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/container';
import { User } from '../entities/User';

export async function authUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'secret';
    const payload = jwt.verify(token, secret) as { userId: number };
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: payload.userId });
    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }
    (req as any).user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
