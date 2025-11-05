import { Schema, model } from 'mongoose';
import { ILibro } from './Libro';
import { IUsuario } from './Usuario';

export interface IPrestamo extends Document {
  libro: ILibro['_id']; // Guarda la referencia al ID del Libro
  usuario: IUsuario['_id']; // Guarda la referencia al ID del Usuario
  fechaPrestamo: Date;
  fechaDevolucion?: Date; // Opcional: la fecha límite
  devuelto: boolean;
}

const PrestamoSchema = new Schema<IPrestamo>({
  libro: { type: Schema.Types.ObjectId, ref: 'Libro', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaPrestamo: { type: Date, default: Date.now },
  fechaDevolucion: { type: Date },
  devuelto: { type: Boolean, default: false }
});

export default model<IPrestamo>('Prestamo', PrestamoSchema);