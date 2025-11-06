import { Schema, model, Document, Types } from 'mongoose'; // <-- AGREGADO: Document, Types
import { ILibro } from './Libro';
import { IUsuario } from './Usuario';

export interface IPrestamo extends Document {
  libro: Types.ObjectId;   // <-- CAMBIO: Usar Types.ObjectId es más directo
  usuario: Types.ObjectId; // <-- CAMBIO: Usar Types.ObjectId es más directo
  fechaPrestamo: Date;
  fechaDevolucion?: Date;
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