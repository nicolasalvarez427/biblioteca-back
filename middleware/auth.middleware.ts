import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: { id: string; rol?: string };
}

const SECRET_KEY = 'biblioteca_secret_key'; // 🔒 cámbialo o usa variable de entorno

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; rol?: string };
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};
export const esAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.usuario?.rol === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
};

