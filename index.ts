import express, { Express, Request, Response } from 'express'; 
import mongoose from 'mongoose'; 
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import authRoutes from './routes/auth.routes'; // <-- IMPORTA LAS RUTAS DE AUTENTICACIÓN
import libroRoutes from './routes/libros.routes'; // <-- IMPORTA LAS RUTAS DE LIBROS
import prestamoRoutes from './routes/prestamos.routes'; // <-- IMPORTA LAS RUTAS DE PRÉSTAMOS
import usuarioRoutes from './routes/usuario.routes'; // <-- IMPORTA LAS RUTAS DE USUARIOS

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
app.use('/api/auth', authRoutes); // <-- 1. USA LAS RUTAS DE AUTENTICACIÓN
app.use('/api/libros', libroRoutes); // <-- 2. USA LAS RUTAS DE LIBROS
app.use('/api/prestamos', prestamoRoutes); // <-- 3. USA LAS RUTAS DE PRÉSTAMOS
app.use('/api/users', usuarioRoutes); // <-- 4. USA LAS RUTAS DE USUARIOS

// Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`); 
});