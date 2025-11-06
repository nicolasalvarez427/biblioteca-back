import { Schema, model, Document } from 'mongoose';

export interface ILibro extends Document {
  titulo: string;
  autor: string;
  isbn?: string;
  disponible: boolean;
  imagenUrl?: string;
  stock: number; // <-- Nuevo campo en la interfaz
}

const LibroSchema = new Schema<ILibro>({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  isbn: { type: String, unique: true, sparse: true },
  disponible: { type: Boolean, default: true },
  imagenUrl: { type: String },
  // Agregamos 'stock' con un valor por defecto de 1
  stock: { type: Number, default: 1, min: 0 } // <-- Nuevo campo en el esquema
});

export default model<ILibro>('Libro', LibroSchema);