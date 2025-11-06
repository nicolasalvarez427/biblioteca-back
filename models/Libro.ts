import { Schema, model, Document } from 'mongoose';

export interface ILibro extends Document {
  titulo: string;
  autor: string;
  isbn?: string;
  disponible: boolean;
  imagenUrl?: string; // <-- Nuevo campo en el backend
}

const LibroSchema = new Schema<ILibro>({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  isbn: { type: String, unique: true, sparse: true },
  disponible: { type: Boolean, default: true },
  imagenUrl: { type: String } // <-- Nuevo campo
});

export default model<ILibro>('Libro', LibroSchema);