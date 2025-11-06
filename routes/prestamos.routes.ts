import express, { Request, Response, Router } from 'express';
import { verificarToken, AuthRequest } from '../middleware/auth.middleware';
import { Libro } from '../models/Libro';
import { Prestamo } from '../models/Prestamo';

const router = Router();

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

    // 2. Verificar si ya lo tiene prestado
    const prestamoActivo = await Prestamo.findOne({
      libro: libroId,
      usuario: usuarioId,
      devuelto: false
    });
    if (prestamoActivo) {
      return res.status(400).json({ message: 'Ya tienes una copia activa de este libro.' });
    }

    // 3. Crear préstamo
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + 7);

    const nuevoPrestamo = new Prestamo({
      libro: libroId,
      usuario: usuarioId,
      fechaDevolucion
    });
    await nuevoPrestamo.save();

    // 4. Actualizar stock
    libro.stock -= 1;
    if (libro.stock === 0) libro.disponible = false;
    await libro.save();

    res.status(201).json({ message: 'Préstamo exitoso', prestamo: nuevoPrestamo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el préstamo' });
  }
});

export default router;
