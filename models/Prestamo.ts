import mongoose, { Schema, Document } from 'mongoose';

export interface IPrestamo extends Document {
  libro: mongoose.Types.ObjectId;
  usuario: mongoose.Types.ObjectId;
  fechaPrestamo: Date;
  fechaDevolucion: Date;
  fechaRetornoReal?: Date;
  devuelto: boolean;
}

const PrestamoSchema = new Schema<IPrestamo>({
  libro: { type: Schema.Types.ObjectId, ref: 'Libro', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaPrestamo: { type: Date, default: Date.now },
  fechaDevolucion: { type: Date, required: true },
  fechaRetornoReal: { type: Date },
  devuelto: { type: Boolean, default: false }
});

export const Prestamo = mongoose.model<IPrestamo>('Prestamo', PrestamoSchema);
