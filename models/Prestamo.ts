import { Schema, model, Document, Types } from 'mongoose';

export interface IPrestamo extends Document {
  libro: Types.ObjectId;
  usuario: Types.ObjectId;
  fechaPrestamo: Date;
  fechaDevolucion: Date;     // Fecha límite prevista (deadline)
  fechaRetornoReal?: Date;   // <-- NUEVO: Fecha real cuando el usuario lo devuelve
  devuelto: boolean;
}

const PrestamoSchema = new Schema<IPrestamo>({
  libro: { type: Schema.Types.ObjectId, ref: 'Libro', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaPrestamo: { type: Date, default: Date.now },
  fechaDevolucion: { type: Date, required: true },
  fechaRetornoReal: { type: Date }, // <-- Nuevo campo opcional
  devuelto: { type: Boolean, default: false }
});

export default model<IPrestamo>('Prestamo', PrestamoSchema);