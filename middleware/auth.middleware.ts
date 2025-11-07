import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// --- Definición del payload del token ---
interface JwtPayload {
  id: string;
  role?: 'Administrador' | 'Estudiante' | 'Usuario';
  username?: string;
}

// --- Request extendido para incluir usuario ---
export interface AuthRequest extends Request {
  usuario?: JwtPayload;
}

const SECRET_KEY = process.env.JWT_SECRET || 'biblioteca_secret_key';

// --- Middleware para verificar token ---
export const verificarToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.toString().replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// --- Middleware para validar rol administrador ---
export const esAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.usuario?.role === 'Administrador') {
    next();
  } else {
    res
      .status(403)
      .json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
};
