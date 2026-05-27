const pool = require("../database/db");

/* =========================
   INICIAR OPERATIVO
========================= */
const iniciarOperativo = async (req, res) => {
  try {

    const {
      vehiculo_id,
      destino,
      km_salida
    } = req.body;

    // buscar vehículo
    const vehiculoRes = await pool.query(
      `
      SELECT *
      FROM vehiculos
      WHERE id = $1
      `,
      [vehiculo_id]
    );

    if (vehiculoRes.rows.length === 0) {
      return res.status(404).json({
        message: "Vehículo no encontrado"
      });
    }

    const vehiculo = vehiculoRes.rows[0];

    // validar estado
    if (vehiculo.estado !== "LIBRE") {
      return res.status(400).json({
        message: "El vehículo no está disponible"
      });
    }

    // validar km
    if (Number(km_salida) < Number(vehiculo.km_actual)) {
      return res.status(400).json({
        message: "KM salida inválido"
      });
    }

    // crear operativo
    const result = await pool.query(
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
      RETURNING *
      `,
      [
        vehiculo_id,
        req.user.id,
        km_salida,
        destino,
        "ACTIVO"
      ]
    );

    // actualizar vehículo
    await pool.query(
      `
      UPDATE vehiculos
      SET
        estado = 'EN USO',
        km_actual = $1
      WHERE id = $2
      `,
      [km_salida, vehiculo_id]
    );

    // historial
    await pool.query(
      `
      INSERT INTO historial_vehiculos
      (
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
        req.user.nombre,
        req.user.id,
        "OPERATIVO_INICIADO",
        `Destino: ${destino}`
      ]
    );

    return res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/* =========================
   FINALIZAR OPERATIVO
========================= */
const finalizarOperativo = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      km_llegada,
      observaciones_llegada
    } = req.body;

    // buscar operativo
    const operativoRes = await pool.query(
      `
      SELECT *
      FROM operativos
      WHERE id = $1
      `,
      [id]
    );

    if (operativoRes.rows.length === 0) {
      return res.status(404).json({
        message: "Operativo no encontrado"
      });
    }

    const operativo = operativoRes.rows[0];

    if (operativo.estado !== "ACTIVO") {
      return res.status(400).json({
        message: "El operativo ya fue finalizado"
      });
    }

    // validar km
    if (Number(km_llegada) < Number(operativo.km_salida)) {
      return res.status(400).json({
        message: "KM llegada inválido"
      });
    }

    // finalizar operativo
    const result = await pool.query(
      `
      UPDATE operativos
      SET
        km_llegada = $1,
        observaciones_llegada = $2,
        fecha_llegada = NOW(),
        estado = 'FINALIZADO'
      WHERE id = $3
      RETURNING *
      `,
      [
        km_llegada,
        observaciones_llegada,
        id
      ]
    );

    // liberar vehículo
    await pool.query(
      `
      UPDATE vehiculos
      SET
        estado = 'LIBRE',
        km_actual = $1
      WHERE id = $2
      `,
      [
        km_llegada,
        operativo.vehiculo_id
      ]
    );

    // historial
    await pool.query(
      `
      INSERT INTO historial_vehiculos
      (
        vehiculo_id,
        usuario,
        usuario_id,
        accion,
        observacion
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        operativo.vehiculo_id,
        req.user.nombre,
        req.user.id,
        "OPERATIVO_FINALIZADO",
        `KM llegada: ${km_llegada}`
      ]
    );

    return res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message
    });
  }
};

/* =========================
   OBTENER OPERATIVOS
========================= */
const obtenerOperativos = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        o.*,
        v.marca,
        v.modelo,
        v.matricula,
        u.nombre
      FROM operativos o

      INNER JOIN vehiculos v
        ON v.id = o.vehiculo_id

      INNER JOIN usuarios u
        ON u.id = o.usuario_id

      ORDER BY o.id DESC
      `
    );

    return res.json(result.rows);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  iniciarOperativo,
  finalizarOperativo,
  obtenerOperativos
};