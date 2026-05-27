const pool = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  try {
    const { nombre, apellido, cedula, email, password, rol } = req.body;

    if (!nombre || !cedula || !email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, cedula, email, password, rol)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, nombre, cedula, email, rol`,
      [nombre, apellido, cedula, email, hashedPassword, rol || 'chofer']
    );

    return res.json(result.rows[0]);

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   LOGIN (POR CÉDULA)
========================= */
const login = async (req, res) => {
  try {
    const { cedula, password } = req.body;

    if (!cedula || !password) {
      return res.status(400).json({
        message: "Cédula y password son obligatorios"
      });
    }

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE cedula = $1',
      [cedula]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Password incorrecta" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        cedula: user.cedula,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login
};