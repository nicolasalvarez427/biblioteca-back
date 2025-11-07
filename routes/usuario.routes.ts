// routes/usuario.routes.ts
import { Router, Response } from 'express';
import Usuario from '../models/Usuario';
import { verificarToken, esAdmin, AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

const router = Router();

// OBTENER TODOS LOS USUARIOS CON SUS PRÉSTAMOS ACTIVOS (Solo admin)
router.get('/', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
  try {
    const usuarios = await Usuario.aggregate([
      {
        // 1. Unimos la colección de usuarios con la de préstamos
        $lookup: {
          from: 'prestamos',         // Nombre de la colección de préstamos en la BD
          localField: '_id',         // Campo ID del usuario
          foreignField: 'usuario',   // Campo en préstamo que referencia al usuario
          pipeline: [
            { $match: { devuelto: false } }, // Filtrar solo los NO devueltos
            {
              // 2. Unimos cada préstamo con su libro para saber el título
              $lookup: {
                from: 'libros',
                localField: 'libro',
                foreignField: '_id',
                as: 'libroInfo'
              }
            },
            // Descomponemos el array 'libroInfo' para que sea un objeto
            { $unwind: '$libroInfo' },
            // --- CAMBIO AQUÍ: Proyectamos el ID del préstamo Y el título ---
            { $project: { _id: 1, titulo: '$libroInfo.titulo' } }
          ],
          as: 'librosPrestados' // El resultado se guardará en este nuevo campo
        }
      },
      {
        // 3. Proyectamos los campos finales que queremos enviar al frontend
        $project: {
          username: 1,
          email: 1,
          role: 1,
          // --- CAMBIO AQUÍ: Ya no mapeamos, 'librosPrestados' es ahora un array de objetos ---
          librosPrestados: 1
        }
      }
    ]);

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener la lista de usuarios' });
  }
});

// ... (Mantenemos la ruta DELETE igual que antes)
router.delete('/:id', [verificarToken, esAdmin], async (req: AuthRequest, res: Response) => {
    // ... (mismo código de eliminación)
    try {
        const { id } = req.params;
        if (req.usuario?.id === id) {
           return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta desde aquí.' });
        }
        const usuarioEliminado = await Usuario.findByIdAndDelete(id);
        if (!usuarioEliminado) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
      }
});

export default router;