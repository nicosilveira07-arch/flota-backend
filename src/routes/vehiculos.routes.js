const express = require('express');
const router = express.Router();

const {
  crearVehiculo,
  obtenerVehiculos,
  actualizarVehiculo,
  obtenerVehiculoPorId,
  eliminarVehiculo,
  getHistorialVehiculo,
  iniciarOperativoVehiculo,
  finalizarVehiculo
} = require('../controllers/vehiculos.controller');

const verifyToken = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');

/* =========================
   CREAR VEHICULO
========================= */
router.post(
  '/',
  verifyToken,
  checkRole("administrador", "ingeniero","pistero"),
  crearVehiculo
);

/* =========================
   OBTENER TODOS
========================= */
router.get(
  '/',
  verifyToken,
  obtenerVehiculos
);

/* =========================
   HISTORIAL (⚠️ SIEMPRE ARRIBA DE :id)
========================= */
router.get(
  '/:id/historial',
  verifyToken,
  getHistorialVehiculo
);

/* =========================
   OBTENER POR ID
========================= */
router.get(
  '/:id',
  verifyToken,
  obtenerVehiculoPorId
);

/* =========================
   ACTUALIZAR
========================= */
router.put(
  '/:id',
  verifyToken,
  checkRole("administrador", "ingeniero","pistero"),
  actualizarVehiculo
);

/* =========================
   ELIMINAR
========================= */
router.delete(
  '/:id',
  verifyToken,
  checkRole("administrador", "ingeniero","pistero"),
  eliminarVehiculo
);

/* =========================
   INICIAR OPERATIVO
========================= */
router.put(
  '/:id/iniciar-operativo',
  verifyToken,
  checkRole("administrador", "ingeniero", "chofer","pistero"),
  iniciarOperativoVehiculo
);

/* =========================
   FINALIZAR OPERATIVO
========================= */
router.put(
  '/:id/finalizar',
  verifyToken,
  checkRole("administrador", "chofer", "ingeniero","pistero"),
  finalizarVehiculo
);

module.exports = router;