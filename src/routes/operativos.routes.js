const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");

const checkRole = require("../middleware/role.middleware");

const {
  iniciarOperativo,
  finalizarOperativo,
  obtenerOperativos
} = require("../controllers/operativos.controller");

/* =========================
   OBTENER
========================= */
router.get(
  "/",
  verifyToken,
  obtenerOperativos
);

/* =========================
   INICIAR
========================= */
router.post(
  "/",
  verifyToken,
  checkRole("ADMIN", "INGENIERO", "PISTERO"),
  iniciarOperativo
);

/* =========================
   FINALIZAR
========================= */
router.put(
  "/:id/finalizar",
  verifyToken,
  checkRole("ADMIN", "INGENIERO", "PISTERO"),
  finalizarOperativo
);

module.exports = router;