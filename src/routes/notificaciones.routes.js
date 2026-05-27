const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

const {
  obtenerNotificaciones,
  marcarLeida,
  eliminarNotificacion
} = require("../controllers/notificaciones.controller");

/* =========================
   VER NOTIFICACIONES
   - Usuario normal: solo las suyas
   - Admin / Pistero: todas
========================= */
router.get(
  "/",
  verifyToken,
  obtenerNotificaciones
);

/* =========================
   MARCAR COMO LEÍDA
========================= */
router.put(
  "/:id/leida",
  verifyToken,
  marcarLeida
);

/* =========================
   ELIMINAR NOTIFICACIÓN
========================= */
router.delete(
  "/:id",
  verifyToken,
  eliminarNotificacion
);

module.exports = router;