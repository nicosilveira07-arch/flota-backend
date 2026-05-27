const pool = require("../database/db");

/* =========================
   CREAR NOTIFICACIÓN
========================= */
const crearNotificacion = async ({ usuario_id, mensaje }) => {
  await pool.query(
    `
    INSERT INTO notificaciones (usuario_id, mensaje)
    VALUES ($1,$2)
    `,
    [usuario_id, mensaje]
  );
};

/* =========================
   OBTENER NOTIFICACIONES
   - CHOFER: solo suyas
   - ADMIN / PISTERO / INGENIERO: todas
========================= */
const obtenerNotificaciones = async (req, res) => {
  try {
    const { id, rol } = req.user;

    let result;

    if (rol === "administrador" || rol === "pistero") {
      result = await pool.query(
        `
        SELECT *
        FROM notificaciones
        ORDER BY id DESC
        `
      );
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM notificaciones
        WHERE usuario_id = $1
        ORDER BY id DESC
        `,
        [id]
      );
    }

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   MARCAR LEÍDA
========================= */
const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE notificaciones
      SET leida = true
      WHERE id = $1 AND usuario_id = $2
      `,
      [id, req.user.id]
    );

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   ELIMINAR NOTIFICACIÓN
========================= */
const eliminarNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM notificaciones
      WHERE id = $1 AND usuario_id = $2
      `,
      [id, req.user.id]
    );

    res.json({ message: "Eliminada" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearNotificacion,
  obtenerNotificaciones,
  marcarLeida,
  eliminarNotificacion
};