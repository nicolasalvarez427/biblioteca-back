import { Router, Response } from 'express';
import Prestamo from '../models/Prestamo';
import Libro from '../models/Libro';
import { verificarToken, esAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// --- RUTAS DE ADMINISTRADOR ---

/**
 * [POST] /api/prestamos/
 * (Admin) Presta un libro a un usuario.
 * Body: { "libroId": "...", "usuarioId": "...", "fechaDevolucion": "..." }
 */
router.post('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const { libroId, usuarioId, fechaDevolucion } = req.body;

    // 1. Verificar que el libro esté disponible
    const libro = await Libro.findById(libroId);
    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    if (!libro.disponible) {
      return res.status(400).json({ message: 'El libro no está disponible actualmente' });
    }

    // 2. Crear el préstamo
    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion: new Date(fechaDevolucion) // Asegurarse que sea formato Fecha
    });
    await nuevoPrestamo.save();

    // 3. Marcar el libro como NO disponible
    libro.disponible = false;
    await libro.save();

    res.status(201).json(nuevoPrestamo);

  } catch (error) {
    res.status(500).json({ message: 'Error al crear el préstamo', error });
  }
});

/**
 * [PUT] /api/prestamos/:id/devolver
 * (Admin) Marca un préstamo como devuelto.
 */
router.put('/:id/devolver', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    // 1. Buscar el préstamo
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }
    if (prestamo.devuelto) {
      return res.status(400).json({ message: 'Este libro ya fue devuelto' });
    }

    // 2. Marcar el préstamo como devuelto
    prestamo.devuelto = true;
    await prestamo.save();

    // 3. Marcar el libro como SÍ disponible
    await Libro.findByIdAndUpdate(prestamo.libro, { disponible: true });

    res.json({ message: 'Libro devuelto exitosamente' });

  } catch (error) {
    res.status(500).json({ message: 'Error al devolver el libro', error });
  }
});

/**
 * [GET] /api/prestamos/
 * (Admin) Obtiene TODOS los préstamos de todos los usuarios
 */
router.get('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    // .populate() es la "magia" de Mongoose:
    // Reemplaza los IDs de 'libro' y 'usuario' con los documentos completos
    const prestamos = await Prestamo.find()
      .populate('libro', 'titulo autor') // <-- Solo trae título y autor del libro
      .populate('usuario', 'username role'); // <-- Solo trae username y role del usuario
      
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los préstamos' });
  }
});


// --- RUTAS DE ESTUDIANTE (Usuario logueado) ---

/**
 * [GET] /api/prestamos/mis-prestamos
 * (Estudiante) Obtiene solo sus propios préstamos
 */
router.get('/mis-prestamos', [verificarToken], async (req: AuthRequest, res: Response) => {
  try {
    // Usamos el ID del token (req.usuario.id), NO el que viene por parámetro, por seguridad.
    const prestamos = await Prestamo.find({ usuario: req.usuario?.id })
      .populate('libro', 'titulo autor isbn')
      .sort({ fechaPrestamo: -1 }); // Ordenar por más reciente

    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mis préstamos' });
  }
});

export default router;