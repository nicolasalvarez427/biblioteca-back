import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario'; // <-- Importamos nuestro Modelo de Usuario

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    // 1. Extraemos TODOS los campos nuevos del cuerpo de la petición
    const { username, password, role, email, firstName, lastName } = req.body;

    // 2. Validaciones básicas (opcional pero recomendado)
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // 3. Verificar si el usuario O el email ya existen
    // Usamos $or para buscar si existe ALGUNO de los dos
    const existeUsuario = await Usuario.findOne({ $or: [{ username }, { email }] });
    if (existeUsuario) {
      return res.status(400).json({ message: 'El nombre de usuario o el correo ya están registrados.' });
    }

    // 4. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Crear el nuevo usuario con TODOS los datos
    const nuevoUsuario = new Usuario({
      username,
      email,          // <-- Guardamos email
      firstName,      // <-- Guardamos nombre
      lastName,       // <-- Guardamos apellido
      password: hashedPassword,
      role: 'Estudiante' // Forzamos el rol, ignorando lo que envíen desde fuera
    });

    // 6. Guardar en MongoDB
    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      userId: usuarioGuardado._id,
      username: usuarioGuardado.username // Devolvemos el username confirmado
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor al registrar usuario.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validaciones mínimas (Si no existe email o password)
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan credenciales (email y password).' });
    }

    // 2. Buscar al usuario
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // 🟢 Mejoramos el mensaje para no dar pistas
      return res.status(401).json({ message: 'Credenciales inválidas.' }); 
    }

    // 3. Comparar la contraseña (bcrypt.compare es ASÍNCRONO)
    // Usaremos un try-catch anidado para asegurar la estabilidad
    try {
      const passwordCorrecta = await bcrypt.compare(password, usuario.password!);
      if (!passwordCorrecta) {
        return res.status(401).json({ message: 'Credenciales inválidas.' });
      }
    } catch (bcryptError) {
        console.error("Error comparando contraseña:", bcryptError);
        return res.status(500).json({ message: 'Error interno en autenticación.' });
    }


    // 4. Crear un Token (JWT)
    const payload = {
      id: usuario._id,
      role: usuario.role
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Este error ya no debería ocurrir si está en Render
      throw new Error('JWT_SECRET no está definida'); 
    }

    // Aseguramos que jwt.sign esté dentro del try principal si lanzara errores
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // 5. Enviar el token
    res.json({
      token,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        role: usuario.role
      }
    });

  } catch (error) {
    console.error('CRITICAL LOGIN ERROR:', error);
    // 🟢 Esto es lo más importante: asegurar que siempre se envíe un 500 y no se cuelgue.
    res.status(500).json({ message: 'Error en el servidor al procesar el login.' }); 
  }
});

export default router;