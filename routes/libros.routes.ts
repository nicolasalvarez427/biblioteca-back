import { Router, Request, Response } from 'express';
import Libro from '../models/Libro';
import { verificarToken, esAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// --- RUTAS PÚBLICAS (Para todos los usuarios) ---

// GET (Leer) - Obtener todos los libros
// (Pública - Estudiantes y Admin pueden verlos)
router.get('/', async (req: Request, res: Response) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los libros' });
  }
});

// GET (Leer) - Obtener un libro por ID
// (Pública - Estudiantes y Admin pueden verlo)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const libro = await Libro.findById(req.params.id);
    if (!libro) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    res.json(libro);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el libro' });
  }
});


// --- RUTAS PRIVADAS (Solo para Administradores) ---
// Usamos los middlewares 'verificarToken' y 'esAdmin'

// POST (Crear) - Añadir un nuevo libro
router.post('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, autor, isbn } = req.body;
    const nuevoLibro = new Libro({ titulo, autor, isbn });
    const libroGuardado = await nuevoLibro.save();
    res.status(201).json(libroGuardado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el libro' });
  }
});

// PUT (Actualizar) - Modificar un libro por ID
router.put('/:id', [verificarToken, esAdmin], async (req: Request, res: Response) => {
  try {
    const libroActualizado = await Libro.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!libroActualizado) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    res.json(libroActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el libro' });
  }
});

// DELETE (Borrar) - Eliminar un libro por ID
router.delete('/:id', [verificarToken, esAdmin], async (req: Request, res: Response) => {
  try {
    const libroEliminado = await Libro.findByIdAndDelete(req.params.id);
    if (!libroEliminado) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }
    res.json({ message: 'Libro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el libro' });
  }
});

export default router;