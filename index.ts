import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de .env

// --- AÑADE ESTA LÍNEA DE PRUEBA ---
console.log('Mi clave MONGO_URI es:', process.env.MONGO_URI);
// ----------------------------------

const app: Express = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones de otros dominios (Vercel)
app.use(express.json()); // Permite a Express entender JSON

// Conectar a MongoDB
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('Error: MONGO_URI no está definida en el archivo .env');
  process.exit(1); // Detiene la aplicación si la URI no existe
}

mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('API de la Biblioteca funcionando');
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});