import { Schema, model } from 'mongoose';

// Definimos la interfaz para TypeScript
export interface IUsuario extends Document {
  username: string;
  password?: string; // El '?' lo hace opcional (útil para no devolverlo en las peticiones)
  role: 'Administrador' | 'Estudiante';
}

const UsuarioSchema = new Schema<IUsuario>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['Administrador', 'Estudiante'],
    default: 'Estudiante'
  }
});

export default model<IUsuario>('Usuario', UsuarioSchema);