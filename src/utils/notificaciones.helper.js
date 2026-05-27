const pool = require("../database/db");

const crearNotificacion = async ({ usuario_id, mensaje }) => {
  try {
    if (!usuario_id || !mensaje) {
      console.log("⚠️ Notificación inválida:", { usuario_id, mensaje });
      return;
    }

    await pool.query(
      `
      INSERT INTO notificaciones (usuario_id, mensaje)
      VALUES ($1, $2)
      `,
      [usuario_id, mensaje]
    );

    console.log("📩 NOTIFICACIÓN ENVIADA:", usuario_id);

  } catch (error) {
    // 🔥 IMPORTANTE: no romper flujo principal
    console.log("❌ ERROR NOTIFICACIÓN:", error.message);
  }
};

module.exports = { crearNotificacion };