import { Router, Response } from 'express';
import { verificarToken, esAdmin, AuthRequest } from '../middleware/auth.middleware';
import { Prestamo } from '../models/Prestamo';
import { Libro } from '../models/Libro';

const router = Router();

// --- RUTAS PARA ESTUDIANTES / USUARIOS ---

// 📘 Solicitar un préstamo
router.post('/solicitar/:libroId', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { libroId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });

    const libro = await Libro.findById(libroId);
    if (!libro || !libro.disponible || libro.stock <= 0) {
      return res.status(400).json({ message: 'Libro no disponible.' });
    }

    const prestamoActivo = await Prestamo.findOne({
      libro: libroId,
      usuario: usuarioId,
      devuelto: false,
    });

    if (prestamoActivo) {
      return res.status(400).json({ message: 'Ya tienes una copia activa de este libro.' });
    }

    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 7);

    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion,
    });
    await nuevoPrestamo.save();

    libro.stock -= 1;
    if (libro.stock === 0) libro.disponible = false;
    await libro.save();

    res.status(201).json({ message: 'Préstamo exitoso', prestamo: nuevoPrestamo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al solicitar préstamo' });
  }
});

// 📗 Devolver un libro
router.put('/devolver/:prestamoId', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const { prestamoId } = req.params;
    const usuarioId = req.usuario?.id;

    const prestamo = await Prestamo.findById(prestamoId);
    if (!prestamo) return res.status(404).json({ message: 'Préstamo no encontrado' });

    if (req.usuario?.role !== 'Administrador' && prestamo.usuario.toString() !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para devolver este libro.' });
    }

    if (prestamo.devuelto) {
      return res.status(400).json({ message: 'Este libro ya fue devuelto.' });
    }

    prestamo.devuelto = true;
    prestamo.fechaRetornoReal = new Date();
    await prestamo.save();

    const libro = await Libro.findById(prestamo.libro);
    if (libro) {
      libro.stock += 1;
      libro.disponible = true;
      await libro.save();
    }

    res.json({ message: 'Libro devuelto con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al devolver el libro' });
  }
});

// 📙 Consultar los préstamos del usuario autenticado
router.get('/mis-prestamos', verificarToken, async (req: AuthRequest, res: Response) => {
  try {
    const prestamos = await Prestamo.find({ usuario: req.usuario?.id })
      .populate('libro', 'titulo autor imagenUrl')
      .sort({ fechaPrestamo: -1 });

    res.json(prestamos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener historial de préstamos' });
  }
});

// --- RUTAS DE ADMINISTRADOR ---

// 📋 Obtener todos los préstamos
router.get('/', [verificarToken, esAdmin], async (_req: AuthRequest, res: Response) => {
  try {
    const prestamos = await Prestamo.find()
      .populate('libro', 'titulo autor')
      .populate('usuario', 'username role');

    res.json(prestamos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los préstamos' });
  }
});

// ➕ Crear un préstamo manualmente (admin)
router.post('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const { libroId, usuarioId, fechaDevolucion } = req.body;

    const libro = await Libro.findById(libroId);
    if (!libro || libro.stock <= 0) {
      return res.status(400).json({ message: 'Libro no disponible para préstamo' });
    }

    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion: new Date(fechaDevolucion),
    });
    await nuevoPrestamo.save();

    libro.stock -= 1;
    if (libro.stock === 0) libro.disponible = false;
    await libro.save();

    res.status(201).json(nuevoPrestamo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear préstamo manual' });
  }
});

export default router;
