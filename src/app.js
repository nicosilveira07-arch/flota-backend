const express = require('express');
const cors = require('cors');
const path = require("path");
require('dotenv').config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

app.get('/', (req, res) => {
  res.send('Api funcionando correctamente');
});

// RUTAS
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vehiculos', require('./routes/vehiculos.routes'));
app.use('/api/reservas', require('./routes/reservas.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/notificaciones', require('./routes/notificaciones.routes'));
app.use('/api/operativos', require('./routes/operativos.routes'));


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});