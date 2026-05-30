const pool = require("../database/db");
const bcrypt = require("bcryptjs");

/* CREAR USUARIO */
const crearUsuario = async (req, res) => {
  try {
    const { nombre, apellido, cedula, password, rol } = req.body;

    if (!nombre || !apellido || !cedula || !password) {
      return res.status(400).json({
        message: "Faltan datos obligatorios"
      });
    }

    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE cedula = $1",
      [cedula]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({
        message: "La cédula ya está registrada"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, cedula, password, rol)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, nombre, apellido, cedula, rol`,
      [nombre, apellido, cedula, hash, rol || "chofer"]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* LISTAR USUARIOS */
const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, apellido, cedula, rol FROM usuarios ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ELIMINAR USUARIO */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM notificaciones WHERE usuario_id = $1",
      [id]
    );

    await pool.query(
      "DELETE FROM operativos WHERE usuario_id = $1",
      [id]
    );

    await pool.query(
      "DELETE FROM reservas WHERE usuario_id = $1",
      [id]
    );

    await pool.query(
      "DELETE FROM usuarios WHERE id = $1",
      [id]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    res.status(500).json({
      error: error.message,
      detail: error.detail,
      constraint: error.constraint
    });
  }
};

/* CAMBIAR ROL */
const cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    await pool.query(
      `UPDATE usuarios SET rol = $1 WHERE id = $2`,
      [rol, id]
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* RESET PASSWORD */
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password requerido"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE usuarios SET password = $1 WHERE id = $2`,
      [hash, id]
    );

    res.json({ ok: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  eliminarUsuario,
  cambiarRolUsuario,
  resetPassword
};