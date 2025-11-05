import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario, { IUsuario } from '../models/Usuario';

// Extendemos la interfaz Request de Express para incluir nuestra propiedad 'usuario'
export interface AuthRequest extends Request {
  usuario?: IUsuario | { id: string, role: string };
}

// Middleware para verificar el Token
export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Error interno: La clave secreta de JWT no está definida.' });
  }

  try {
    const payload = jwt.verify(token, secret) as { id: string, role: string };
    req.usuario = payload; // Adjuntamos el payload (id y role) a la petición
    next(); // El token es válido, continuamos
  } catch (error) {
    res.status(400).json({ message: 'Token no válido.' });
  }
};

// Middleware para verificar si es Administrador
export const esAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.usuario?.role !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado. Requiere rol de Administrador.' });
  }
  next(); // Es admin, continuamos
};