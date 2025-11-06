import { Router, Response } from 'express';
import Prestamo from '../models/Prestamo';
import Libro from '../models/Libro';
import { verificarToken, esAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// --- RUTAS DE ADMINISTRADOR ---

/**
 * [POST] /api/prestamos/
 * Presta un libro: Resta 1 al stock. Si stock llega a 0, disponible = false.
 */
router.post('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const { libroId, usuarioId, fechaDevolucion } = req.body;

    // 1. Verificar stock del libro
    const libro = await Libro.findById(libroId);
    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    if (libro.stock <= 0) {
      return res.status(400).json({ message: 'No hay stock disponible para préstamo' });
    }

    // 2. Crear el registro de préstamo
    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion: new Date(fechaDevolucion)
    });
    await nuevoPrestamo.save();

    // 3. ACTUALIZAR LIBRO: Restar stock y verificar disponibilidad
    libro.stock -= 1;
    if (libro.stock === 0) {
      libro.disponible = false;
    }
    await libro.save();

    res.status(201).json(nuevoPrestamo);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el préstamo', error });
  }
});

/**
 * [PUT] /api/prestamos/:id/devolver
 * Devuelve un libro: Suma 1 al stock. Siempre disponible = true (porque ahora hay al menos 1).
 */
router.put('/:id/devolver', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    // 1. Buscar y validar el préstamo
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }
    if (prestamo.devuelto) {
      return res.status(400).json({ message: 'Este préstamo ya fue devuelto' });
    }

    // 2. Marcar préstamo como devuelto
    prestamo.devuelto = true;
    await prestamo.save();

    // 3. ACTUALIZAR LIBRO: Sumar stock y marcar como disponible
    const libro = await Libro.findById(prestamo.libro);
    if (libro) {
      libro.stock += 1;
      libro.disponible = true; // Si devolvemos uno, seguro está disponible
      await libro.save();
    }

    res.json({ message: 'Libro devuelto exitosamente', nuevoStock: libro?.stock });

  } catch (error) {
    res.status(500).json({ message: 'Error al devolver el libro', error });
  }
});

// ... (Las rutas GET pueden quedar igual) ...
router.get('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
    // ... implementación actual ...
    try {
        const prestamos = await Prestamo.find()
          .populate('libro', 'titulo autor')
          .populate('usuario', 'username role');
        res.json(prestamos);
      } catch (error) {
        res.status(500).json({ message: 'Error al obtener los préstamos' });
      }
});

router.get('/mis-prestamos', [verificarToken], async (req: AuthRequest, res: Response) => {
    // ... implementación actual ...
    try {
        const prestamos = await Prestamo.find({ usuario: req.usuario?.id })
          .populate('libro', 'titulo autor isbn')
          .sort({ fechaPrestamo: -1 });
        res.json(prestamos);
      } catch (error) {
        res.status(500).json({ message: 'Error al obtener mis préstamos' });
      }
});

// --- RUTA PARA ESTUDIANTES: SOLICITAR PRÉSTAMO ---
router.post('/solicitar/:libroId', [verificarToken], async (req: AuthRequest, res: Response) => {
  try {
    const { libroId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });

    // 1. Validar Libro y Stock
    const libro = await Libro.findById(libroId);
    if (!libro || !libro.disponible || libro.stock <= 0) {
      return res.status(400).json({ message: 'Libro no disponible para préstamo.' });
    }

    // 2. Verificar si ya lo tiene prestado (Opcional pero recomendado)
    const prestamoActivo = await Prestamo.findOne({ libro: libroId, usuario: usuarioId, devuelto: false });
    if (prestamoActivo) {
      return res.status(400).json({ message: 'Ya tienes una copia activa de este libro.' });
    }

    // 3. Crear Préstamo (15 días de plazo)
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 15);

    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion
    });
    await nuevoPrestamo.save();

    // 4. Actualizar Stock del Libro
    libro.stock -= 1;
    if (libro.stock === 0) libro.disponible = false;
    await libro.save();

    res.status(201).json({ message: 'Préstamo exitoso', prestamo: nuevoPrestamo });

  } catch (error) {
    res.status(500).json({ message: 'Error al procesar el préstamo' });
  }
});

export default router;