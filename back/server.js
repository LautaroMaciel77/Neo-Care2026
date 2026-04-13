const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./backend/config/db');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./backend/routes/authRoutes'));

app.use('/api/protected', require('./backend/routes/protectedRoutes'));
app.use('/api/turnos', require('./backend/routes/turnoRoutes'));


// Conexión a la base de datos
connectDB();

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));