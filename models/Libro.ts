import { Schema, model, Document } from 'mongoose'; // <-- AGREGADO: Document

export interface ILibro extends Document {
  titulo: string;
  autor: string;
  isbn?: string;
  disponible: boolean;
}

const LibroSchema = new Schema<ILibro>({
  titulo: { type: String, required: true },
  autor: { type: String, required: true },
  isbn: { type: String, unique: true, sparse: true },
  disponible: { type: Boolean, default: true }
});

export default model<ILibro>('Libro', LibroSchema);