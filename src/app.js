const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

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