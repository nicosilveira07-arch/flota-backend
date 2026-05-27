const express = require('express');

const verifyToken =
  require('../middleware/auth.middleware');

const checkRole =
  require('../middleware/role.middleware');

const router = express.Router();

const {
  crearReserva,
  obtenerReservas,
  cambiarEstadoReserva,
  aprobarReserva,
  rechazarReserva
} = require('../controllers/reservas.controller');

/* =========================
   CREAR
========================= */

router.post(
  '/',
  verifyToken,
  crearReserva
);

/* =========================
   OBTENER
========================= */

router.get(
  '/',
  verifyToken,
  obtenerReservas
);

/* =========================
   APROBAR
========================= */

router.put(
  '/:id/aprobar',
  verifyToken,
  checkRole(
    'administrador',
    'ingeniero',
    'encargado_flota'
  ),
  aprobarReserva
);

/* =========================
   RECHAZAR
========================= */

router.put(
  '/:id/rechazar',
  verifyToken,
  checkRole(
    'administrador',
    'ingeniero',
    'encargado_flota'
  ),
  rechazarReserva
);

/* =========================
   CAMBIAR ESTADO
========================= */

router.put(
  '/:id/estado',
  verifyToken,
  checkRole(
    'administrador',
    'ingeniero',
    'encargado_flota'
  ),
  cambiarEstadoReserva
);

module.exports = router;