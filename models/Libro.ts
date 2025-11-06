import mongoose, { Schema, Document } from 'mongoose';

export interface ILibro extends Document {
  titulo: string;
  autor: string;
  disponible: boolean;
  stock: number;
  imagenUrl?: string;
}

const LibroSchema = new Schema<ILibro>({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  disponible: { type: Boolean, default: true },
  stock: { type: Number, default: 1 },
  imagenUrl: { type: String }
});

export const Libro = mongoose.model<ILibro>('Libro', LibroSchema);
