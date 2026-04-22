import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_para_desarrollo_123';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('No autorizado. Token faltante.') as ApiError;
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    const error = new Error('No autorizado. Token inválido o expirado.') as ApiError;
    error.statusCode = 401;
    return next(error);
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (!req.user || req.user.role !== 'ADMIN') {
    const error = new Error('Permisos insuficientes. Se requiere rol de Administrador.') as ApiError;
    error.statusCode = 403;
    return next(error);
  }
  next();
};
