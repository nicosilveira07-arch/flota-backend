const pool = require('../database/db');

const { crearNotificacion } = require("../utils/notificaciones.helper");
/* =========================
   CREAR RESERVA
========================= */
const crearReserva = async (req, res) => {
  try {
    const {
      vehiculo_id,
      fecha,
      hora_desde,
      hora_hasta,
      motivo
    } = req.body;

    if (!vehiculo_id || !fecha || !hora_desde || !hora_hasta || !motivo) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const usuario_id = req.user?.id;
    const usuario_nombre = req.user?.nombre || "sistema";
      
    if (!usuario_id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    
    const reservaActiva = await pool.query(
      `
      SELECT id
      FROM reservas
      WHERE usuario_id = $1
      AND estado IN ('PENDIENTE', 'APROBADA')
      LIMIT 1
      `,
      [usuario_id]
    );
    
    if (reservaActiva.rows.length > 0) {
      return res.status(400).json({
        error: "Ya tienes una reserva activa"
      });
    }

    const vehiculoRes = await pool.query(
      `SELECT * FROM vehiculos WHERE id = $1`,
      [vehiculo_id]
    );

    if (vehiculoRes.rows.length === 0) {
      return res.status(404).json({ message: "Vehículo no encontrado" });
    }

    const vehiculo = vehiculoRes.rows[0];

    if (vehiculo.estado === "EN USO" || vehiculo.estado === "RADIADO") {
      return res.status(400).json({ error: "El vehículo no está disponible para reservar" });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(`${fecha}T00:00:00`);

    if (isNaN(fechaReserva.getTime())) {
      return res.status(400).json({ error: "Fecha inválida" });
    }

    if (fechaReserva < hoy) {
      return res.status(400).json({ error: "No puedes reservar fechas anteriores a hoy" });
    }

    const [h1, m1] = hora_desde.split(":").map(Number);
    const [h2, m2] = hora_hasta.split(":").map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    if (inicio >= fin) {
      return res.status(400).json({ error: "La hora final debe ser mayor a la inicial" });
    }

    const conflicto = await pool.query(
      `
      SELECT 1
      FROM reservas
      WHERE vehiculo_id = $1
      AND fecha = $2
      AND estado IN ('PENDIENTE', 'APROBADA')
      AND (
        (hora_desde <= $3 AND hora_hasta > $3)
        OR
        (hora_desde < $4 AND hora_hasta >= $4)
        OR
        ($3 <= hora_desde AND $4 >= hora_hasta)
      )
      `,
      [vehiculo_id, fecha, hora_desde, hora_hasta]
    );

    if (conflicto.rows.length > 0) {
      return res.status(400).json({ error: "Ya existe una reserva en ese horario" });
    }

    const result = await pool.query(
      `
      INSERT INTO reservas (
        vehiculo_id,
        usuario_id,
        fecha,
        hora_desde,
        hora_hasta,
        motivo,
        estado
      )
      VALUES ($1,$2,$3,$4,$5,$6,'PENDIENTE')
      RETURNING *
      `,
      [
        vehiculo_id,
        usuario_id,
        fecha,
        hora_desde,
        hora_hasta,
        motivo
      ]
    );

    const reserva = result.rows[0];

    // =========================
    // ✔ NOTIFICAR ADMIN / PISTERO
    // =========================
    const admins = await pool.query(
      `SELECT id FROM usuarios WHERE rol IN ('administrador', 'pistero')`
    );

    for (const admin of admins.rows) {
      await crearNotificacion({
        usuario_id: admin.id,
        mensaje: `Nueva reserva solicitada por ${usuario_nombre}`
      });
    }

    // =========================
    // ✔ NOTIFICAR USUARIO
    // =========================
    await crearNotificacion({
      usuario_id,
      mensaje: "Tu reserva fue enviada y está pendiente de aprobación"
    });

    // =========================
    // ✔ HISTORIAL
    // =========================
    await pool.query(
      `
      INSERT INTO historial_vehiculos (
        vehiculo_id,
        usuario,
        usuario_id,
        accion,
        observacion
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        vehiculo_id,
        usuario_nombre,
        usuario_id,
        "RESERVA_PENDIENTE",
        `Reserva creada (${fecha} ${hora_desde}-${hora_hasta})`
      ]
    );

    return res.status(201).json({
      message: "Reserva enviada correctamente",
      reserva
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
const aprobarReserva = async (req, res) => {
  try {
    const idReserva = Number(req.params.id);

    const reservaRes = await pool.query(
      `SELECT * FROM reservas WHERE id = $1`,
      [id]
    );

    if (reservaRes.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservaRes.rows[0];

    if (reserva.estado === "APROBADA") {
      return res.status(400).json({ error: "Ya está aprobada" });
    }

    await pool.query(
      `UPDATE reservas SET estado = 'APROBADA' WHERE id = $1`,
      [id]
    );

    await pool.query(
      `UPDATE vehiculos SET estado = 'RESERVADO' WHERE id = $1`,
      [reserva.vehiculo_id]
    );

    // 🔥 QUIÉN LO APROBÓ
    const aprobador = `${req.user.nombre} (${req.user.rol})`;

    await crearNotificacion({
      usuario_id: reserva.usuario_id,
      mensaje: `Tu reserva fue APROBADA por ${aprobador}`
    });

    return res.json({ message: "Reserva aprobada correctamente" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const rechazarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const reservaRes = await pool.query(
      `SELECT * FROM reservas WHERE id = $1`,
      [id]
    );

    if (reservaRes.rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    const reserva = reservaRes.rows[0];

    if (reserva.estado === "RECHAZADA") {
      return res.status(400).json({ error: "Ya está rechazada" });
    }

    await pool.query(
      `UPDATE reservas SET estado = 'RECHAZADA' WHERE id = $1`,
      [id]
    );

    await pool.query(
      `UPDATE vehiculos SET estado = 'LIBRE' WHERE id = $1`,
      [reserva.vehiculo_id]
    );

    const responsable = `${req.user.nombre} (${req.user.rol})`;

    await crearNotificacion({
      usuario_id: reserva.usuario_id,
      mensaje: `RECHAZADA: ${motivo || "Sin motivo"} | por ${responsable}`
    });

    return res.json({ message: "Reserva rechazada" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
/* =========================
   OBTENER RESERVAS
========================= */
const obtenerReservas = async (req, res) => {
  try {

    let query = `
      SELECT
        reservas.id,
        vehiculos.marca,
        vehiculos.modelo,

        TRIM(usuarios.nombre || ' ' || usuarios.apellido) AS solicitante,

        reservas.fecha,
        reservas.hora_desde,
        reservas.hora_hasta,
        reservas.motivo,
        reservas.estado,
        reservas.motivo_rechazo,

        reservas.aprobado_por,
        reservas.rechazado_por,

        TRIM(u1.nombre || ' ' || u1.apellido) AS aprobado_por_nombre,
        TRIM(u2.nombre || ' ' || u2.apellido) AS rechazado_por_nombre

      FROM reservas
      INNER JOIN vehiculos
        ON reservas.vehiculo_id = vehiculos.id
      INNER JOIN usuarios
        ON reservas.usuario_id = usuarios.id

      LEFT JOIN usuarios u1
        ON reservas.aprobado_por = u1.id

      LEFT JOIN usuarios u2
        ON reservas.rechazado_por = u2.id
    `;

    let params = [];

    // 🔥 FILTRO POR ROL
    if (req.user.rol !== "administrador") {
      query += ` WHERE reservas.usuario_id = $1 `;
      params.push(req.user.id);
    }

    query += ` ORDER BY reservas.id DESC `;

    const result = await pool.query(query, params);

    return res.json(result.rows);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

/* =========================
   CAMBIAR ESTADO RESERVA
========================= */
const cambiarEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo_rechazo } = req.body;

    const estadosValidos = ["APROBADA", "RECHAZADA"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    // =========================
    // VALIDAR RESERVA
    // =========================
    const reservaActual = await pool.query(
      `SELECT * FROM reservas WHERE id = $1`,
      [id]
    );

    if (reservaActual.rows.length === 0) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    const actual = reservaActual.rows[0];

    if (actual.estado !== "PENDIENTE") {
      return res.status(400).json({
        message: "La reserva ya fue procesada"
      });
    }

    // =========================
    // UPDATE RESERVA
    // =========================
    const result = await pool.query(
      `
      UPDATE reservas
      SET
        estado = $1::text,
        motivo_rechazo = $2::text,
        aprobado_por = CASE
          WHEN $1 = 'APROBADA' THEN $3::int
          ELSE aprobado_por
        END,
        rechazado_por = CASE
          WHEN $1 = 'RECHAZADA' THEN $3::int
          ELSE rechazado_por
        END
      WHERE id = $4::int
      RETURNING *
      `,
      [
        estado,
        (motivo_rechazo || null),
        Number(req.user.id),
        Number(id)
      ]
    );

    const data = result.rows[0];

    if (!data) {
      return res.status(500).json({
        error: "No se pudo actualizar la reserva"
      });
    }

    // =========================
    // VEHÍCULOS
    // =========================
    if (estado === "APROBADA") {
      await pool.query(
        `UPDATE vehiculos SET estado = 'RESERVADO' WHERE id = $1`,
        [data.vehiculo_id]
      );
    }

    if (estado === "FINALIZADA" || estado === "RECHAZADA") {
      await pool.query(
        `UPDATE vehiculos SET estado = 'LIBRE' WHERE id = $1`,
        [data.vehiculo_id]
      );
    }

    // =========================
    // HISTORIAL
    // =========================
    try {
      await pool.query(
        `
        INSERT INTO historial_vehiculos
        (vehiculo_id, usuario, usuario_id, accion, observacion)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          data.vehiculo_id,
          req.user.nombre || "sistema",
          req.user.id,
          `RESERVA_${estado}`,
          motivo_rechazo || `Reserva ${estado}`
        ]
      );
    } catch (e) {
      console.log("HISTORIAL ERROR:", e.message);
    }

    // =========================
    // NOTIFICACIONES (FIX CRÍTICO)
    // =========================
    try {
      const { crearNotificacion } = require("../utils/notificaciones.helper");

      const usuarioDestino = actual.usuario_id; // 🔥 CLAVE: usar "actual", no "data"

      if (estado === "APROBADA") {
        await crearNotificacion({
          usuario_id: usuarioDestino,
          mensaje: `Tu reserva fue aprobada por ${req.user.nombre || "un usuario"}`
        });
      }

      if (estado === "RECHAZADA") {
        await crearNotificacion({
          usuario_id: usuarioDestino,
          mensaje: `Tu reserva fue rechazada. Motivo: ${motivo_rechazo || "Sin motivo"}`
        });
      }

    } catch (err) {
      console.log("NOTIFICACION ERROR:", err.message);
    }

    return res.json(data);

  } catch (error) {
    console.log("ERROR GLOBAL:", error);
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  crearReserva,
  obtenerReservas,
  cambiarEstadoReserva,
  aprobarReserva,
  rechazarReserva
};