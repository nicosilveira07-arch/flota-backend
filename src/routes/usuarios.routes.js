const express = require("express");
const router = express.Router();

const {
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
  cambiarRolUsuario,
  resetPassword
} = require("../controllers/usuarios.controller");

const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

/* =========================
   LISTAR USUARIOS
========================= */
router.get(
  "/",
  verifyToken,
  obtenerUsuarios
);

/* =========================
   CREAR USUARIO
========================= */
router.post(
  "/",
  verifyToken,
  checkRole("administrador", "ingeniero"),
  crearUsuario
);

/* =========================
   ELIMINAR USUARIO
========================= */
router.delete(
  "/:id",
  verifyToken,
  checkRole("administrador", "ingeniero"),
  eliminarUsuario
);

/* =========================
   CAMBIAR ROL
========================= */
router.put(
  "/:id/rol",
  verifyToken,
  checkRole("administrador", "ingeniero"),
  cambiarRolUsuario
);

/* =========================
   RESET PASSWORD
========================= */
router.put(
  "/:id/password",
  verifyToken,
  checkRole("administrador", "ingeniero"),
  resetPassword
);

module.exports = router;