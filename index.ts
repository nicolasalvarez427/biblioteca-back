import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes'; // <-- 1. IMPORTADO

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('Error: MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('API de la Biblioteca funcionando');
});

// --- RUTAS DE LA API ---
app.use('/api/auth', authRoutes); // <-- 2. AÑADIDO

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});