const pool = require('../database/db');

/* =========================
   HISTORIAL HELPER
========================= */
const registrarHistorial = async ({
  vehiculo_id,
  usuario,
  usuario_id,
  accion,
  observacion = null
}) => {
  try {
    await pool.query(
      `
      INSERT INTO historial_vehiculos
      (vehiculo_id, usuario, usuario_id, accion, observacion)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [vehiculo_id, usuario, usuario_id, accion, observacion]
    );
  } catch (error) {
    console.log("ERROR HISTORIAL:", error.message);
  }
};

/* =========================
   CREAR VEHICULO
========================= */
const crearVehiculo = async (req, res) => {
  try {
    const {
      tipo = "",
      marca = "",
      modelo = "",
      matricula = "",
      anio = null,
      km_actual = 0,
      estado = "LIBRE",
      imagen = req.body.imagen || ""
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehiculos
      (tipo, marca, modelo, matricula, anio, km_actual, estado, imagen)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        tipo,
        marca,
        modelo,
        matricula,
        anio ? Number(anio) : null,
        km_actual ? Number(km_actual) : 0,
        estado,
        imagen
      ]
    );

    const vehiculo = result.rows[0];

    // 🔥 HISTORIAL
    await registrarHistorial({
      vehiculo_id: vehiculo.id,
      usuario: req.user?.nombre || "sistema",
      usuario_id: req.user?.id || null,
      accion: "CREADO",
      observacion: "Vehículo creado"
    });

    return res.json(vehiculo);

  } catch (error) {
    console.error("ERROR CREATE VEHICULO:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   OBTENER TODOS
========================= */
const obtenerVehiculos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (v.id)

        /* =========================
           VEHICULO
        ========================= */
        v.id,
        v.tipo,
        v.marca,
        v.modelo,
        v.matricula,
        v.anio,
        v.km_actual,
        v.estado,
        v.imagen,
        v.motivo_radiado,

        /* =========================
           RESERVA
        ========================= */
        r.id AS reserva_id,
        r.fecha,
        r.hora_desde,
        r.hora_hasta,
        r.motivo,
        r.estado AS reserva_estado,
        r.usuario_id AS solicitante_id,

        /* =========================
           OPERATIVO
        ========================= */
        o.id AS operativo_id,
        o.usuario_id AS operativo_usuario_id,
        o.destino,
        o.km_salida,
        o.fecha_salida,
        o.estado AS operativo_estado,

        /* =========================
           USUARIOS (SAFE)
        ========================= */
        u1.nombre AS chofer,
        CONCAT(COALESCE(u2.nombre,''), ' ', COALESCE(u2.apellido,'')) AS solicitante

      FROM vehiculos v

      /* =========================
         RESERVAS
      ========================= */
      LEFT JOIN reservas r
        ON r.vehiculo_id = v.id
        AND r.estado IN ('PENDIENTE', 'APROBADA')

      LEFT JOIN usuarios u2
        ON u2.id = r.usuario_id

      /* =========================
         OPERATIVOS
      ========================= */
      LEFT JOIN operativos o
        ON o.vehiculo_id = v.id
        AND o.estado = 'ACTIVO'

      LEFT JOIN usuarios u1
        ON u1.id = o.usuario_id

      ORDER BY
        v.id,
        r.id DESC NULLS LAST,
        o.id DESC NULLS LAST
    `);

    return res.json(result.rows);

  } catch (error) {
    console.error("ERROR GET VEHICULOS:", error);

    return res.status(500).json({
      error: "Error obteniendo vehículos"
    });
  }
};
/* =========================
   OBTENER POR ID
========================= */
const obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM vehiculos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehiculo no encontrado' });
    }

    return res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR GET VEHICULO:", error);
    return res.status(500).json({ error: error.message });
  }
};

/* =========================
   ACTUALIZAR VEHICULO
========================= */
const actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      tipo,
      marca,
      modelo,
      matricula,
      anio,
      km_actual,
      estado,
      imagen,
      motivo_radiado
    } = req.body;
  

    const result = await pool.query(
      `
      UPDATE vehiculos
      SET
        tipo = $1,
        marca = $2,
        modelo = $3,
        matricula = $4,
        anio = $5,
        km_actual = $6,
        estado = $7,
        imagen = $8,
        motivo_radiado = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        tipo,
        marca,
        modelo,
        matricula,
        anio,
        km_actual,
        estado,
        imagen,
        motivo_radiado,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehiculo no encontrado" });
    }

    return res.json(result.rows[0]);

  } catch (error) {
    console.error("ERROR UPDATE VEHICULO:", error);
    return res.status(500).json({ error: error.message });
  }
};
/* =========================
   INICIAR OPERATIVO
========================= */
const iniciarOperativoVehiculo = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      operativo,
      observacion,
      kmSalida
    } = req.body;
    if (!operativo || !kmSalida) {
      return res.status(400).json({
        error: "Faltan datos obligatorios"
      });
    }

    // buscar vehículo
    const vehiculoRes = await pool.query(
      `
      SELECT * FROM vehiculos
      WHERE id = $1
      `,
      [id]
    );

    if (vehiculoRes.rows.length === 0) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    const vehiculo = vehiculoRes.rows[0];

    // validar estado
    if (vehiculo.estado === "EN USO") {
      return res.status(400).json({
        error: "El vehículo ya está en uso"
      });
    }

    if (vehiculo.estado === "RESERVADO") {

      const reservaRes = await pool.query(
        `
        SELECT *
        FROM reservas
        WHERE vehiculo_id = $1
          AND estado = 'APROBADA'
        ORDER BY id DESC
        LIMIT 1
        `,
        [id]
      );
    
      const reserva = reservaRes.rows[0];
    
      if (!reserva) {
        return res.status(400).json({
          error: "El vehículo está reservado"
        });
      }
    
      if (Number(reserva.usuario_id) !== Number(req.user.id)) {
        return res.status(403).json({
          error: "La reserva pertenece a otro usuario"
        });
      }
    }

    if (vehiculo.estado === "RADIADO") {
      return res.status(400).json({
        error: "El vehículo está fuera de servicio"
      });
    }

    // validar km
    if (Number(kmSalida) < Number(vehiculo.km_actual)) {
      return res.status(400).json({
        error: "KM inválido"
      });
    }

    // crear operativo
    await pool.query(
      `
      INSERT INTO operativos
      (
        vehiculo_id,
        usuario_id,
        km_salida,
        destino,
        fecha_salida,
        estado
      )
      VALUES ($1,$2,$3,$4,NOW(),$5)
      `,
      [
        id,
        req.user.id,
        kmSalida,
        operativo,
        "ACTIVO"
      ]
    );

    // actualizar vehículo
    const result = await pool.query(
      `
      UPDATE vehiculos
      SET
        estado = 'EN USO',
        km_actual = $1
      WHERE id = $2
      RETURNING *
      `,
      [kmSalida, id]
    );

    const actualizado = result.rows[0];

    // historial
    await registrarHistorial({
      vehiculo_id: id,
      usuario: req.user?.nombre || "sistema",
      usuario_id: req.user?.id || null,
      accion: "OPERATIVO_INICIADO",
      observacion:
        `Destino: ${operativo} | KM salida: ${kmSalida} | ${observacion || ""}`
    });

    return res.json(actualizado);

  } catch (error) {

    console.error("ERROR INICIAR OPERATIVO:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/* =========================
   FINALIZAR OPERATIVO
========================= */
const finalizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { kmLlegada, observacion } = req.body;

    /* =========================
       VEHÍCULO
    ========================= */
    const vehiculoRes = await pool.query(
      `SELECT * FROM vehiculos WHERE id = $1`,
      [id]
    );

    if (vehiculoRes.rows.length === 0) {
      return res.status(404).json({
        error: "Vehículo no encontrado"
      });
    }

    const vehiculo = vehiculoRes.rows[0];

    /* =========================
       OPERATIVO ACTIVO
    ========================= */
    const operativoRes = await pool.query(
      `
      SELECT *
      FROM operativos
      WHERE vehiculo_id = $1
        AND estado = 'ACTIVO'
      ORDER BY id DESC
      LIMIT 1
      `,
      [id]
    );

    if (operativoRes.rows.length === 0) {
      return res.status(400).json({
        error: "No hay operativo activo"
      });
    }

    const operativo = operativoRes.rows[0];

    /* =========================
       RESERVA ACTIVA (PARA PERMISOS)
    ========================= */
    const reservaRes = await pool.query(
      `
      SELECT usuario_id
      FROM reservas
      WHERE vehiculo_id = $1
        AND estado = 'APROBADA'
      ORDER BY id DESC
      LIMIT 1
      `,
      [id]
    );

    const reservaUsuarioId = reservaRes.rows[0]?.usuario_id;

    /* =========================
       VALIDACIÓN PERMISOS
    ========================= */
    const esOperador =
      Number(operativo.usuario_id) === Number(req.user.id);

    const esReservador =
      Number(reservaUsuarioId) === Number(req.user.id);

    if (!esOperador && !esReservador) {
      return res.status(403).json({
        error: "No tenés permiso para finalizar este operativo"
      });
    }

    /* =========================
       VALIDAR KM
    ========================= */
    if (Number(kmLlegada) < Number(vehiculo.km_actual)) {
      return res.status(400).json({
        error: "El km de llegada no puede ser menor al actual"
      });
    }

    /* =========================
       FINALIZAR OPERATIVO
    ========================= */
    await pool.query(
      `
      UPDATE operativos
      SET
        km_llegada = $1,
        observaciones_llegada = $2,
        fecha_llegada = NOW(),
        estado = 'FINALIZADO'
      WHERE id = $3
      `,
      [
        kmLlegada,
        observacion || null,
        operativo.id
      ]
    );
    await pool.query(
      `
      UPDATE reservas
      SET estado = 'FINALIZADA'
      WHERE vehiculo_id = $1
        AND estado = 'APROBADA'
      `,
      [id]
    );
    

    /* =========================
       LIBERAR VEHÍCULO
    ========================= */
    const result = await pool.query(
      `
      UPDATE vehiculos
      SET
        km_actual = $1,
        estado = 'LIBRE'
      WHERE id = $2
      RETURNING *
      `,
      [kmLlegada, id]
    );

    const actualizado = result.rows[0];

    /* =========================
       HISTORIAL
    ========================= */
    await registrarHistorial({
      vehiculo_id: id,
      usuario: req.user?.nombre || "sistema",
      usuario_id: req.user?.id || null,
      accion: "OPERATIVO_FINALIZADO",
      observacion: `KM llegada: ${kmLlegada}`
    });
  

    return res.json(actualizado);

  } catch (error) {
    console.error("ERROR FINALIZAR VEHICULO:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/* =========================
   ELIMINAR VEHICULO
========================= */
const eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      'DELETE FROM reservas WHERE vehiculo_id = $1',
      [id]
    );

    const result = await pool.query(
      'DELETE FROM vehiculos WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Vehiculo no encontrado' });
    }

    const vehiculo = result.rows[0];

    // 🔥 HISTORIAL
    await registrarHistorial({
      vehiculo_id: vehiculo.id,
      usuario: req.user?.nombre || "sistema",
      usuario_id: req.user?.id || null,
      accion: "ELIMINADO",
      observacion: "Vehículo eliminado"
    });

    return res.json({
      message: 'Vehiculo eliminado',
      vehiculo
    });

  } catch (error) {
    console.error("ERROR DELETE VEHICULO:", error);
    return res.status(500).json({ error: error.message });
  }
};
const getHistorialVehiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        h.*,

        u.nombre AS usuario_nombre,

        CONCAT(
          COALESCE(u.nombre, ''),
          ' ',
          COALESCE(u.apellido, '')
        ) AS chofer_nombre

      FROM historial_vehiculos h

      LEFT JOIN usuarios u
        ON u.id = h.usuario_id

      WHERE h.vehiculo_id = $1

      ORDER BY h.created_at DESC
      `,
      [id]
    );

    return res.json(result.rows);

  } catch (error) {

    console.error("ERROR HISTORIAL:", error);

    return res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  crearVehiculo,
  obtenerVehiculos,
  actualizarVehiculo,
  obtenerVehiculoPorId,
  eliminarVehiculo,
  getHistorialVehiculo,
  iniciarOperativoVehiculo,
  finalizarVehiculo
};