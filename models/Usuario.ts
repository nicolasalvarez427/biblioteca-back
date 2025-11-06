import { Schema, model, Document } from 'mongoose';

// 1. Definimos la interfaz para TypeScript (para que el editor nos ayude)
export interface IUsuario extends Document {
  username: string;
  email: string;        // <-- Nuevo campo
  firstName: string;    // <-- Nuevo campo
  lastName: string;     // <-- Nuevo campo
  password?: string;
  role: 'Administrador' | 'Estudiante';
}

// 2. Definimos el Esquema de Mongoose (para la base de datos)
const UsuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true }, // <-- Email único y requerido
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['Administrador', 'Estudiante'],
    default: 'Estudiante'
  }
}, {
  timestamps: true // <-- Opcional: agrega automáticamente campos createdAt y updatedAt
});

export default model<IUsuario>('Usuario', UsuarioSchema);