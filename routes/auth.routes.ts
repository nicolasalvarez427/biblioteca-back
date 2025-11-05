import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario'; // <-- Importamos nuestro Modelo de Usuario

const router = Router();

// --- RUTA DE REGISTRO (POST /api/auth/register) ---
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;

    // 1. Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ username });
    if (existeUsuario) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Crear el nuevo usuario
    const nuevoUsuario = new Usuario({
      username,
      password: hashedPassword,
      role // 'Administrador' o 'Estudiante'
    });

    // 4. Guardar en MongoDB
    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      userId: usuarioGuardado._id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- RUTA DE LOGIN (POST /api/auth/login) ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // 1. Buscar al usuario
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // 2. Comparar la contraseña
    const passwordCorrecta = await bcrypt.compare(password, usuario.password!);
    if (!passwordCorrecta) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // 3. Si todo está bien, crear un Token (JWT)
    const payload = {
      id: usuario._id,
      role: usuario.role
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definida');
    }

    const token = jwt.sign(payload, secret, {
      expiresIn: '1h' // El token expira en 1 hora
    });

    // 4. Enviar el token y los datos del usuario al frontend
    res.json({
      token,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        role: usuario.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;