const pool = require("../database/db");
const bcrypt = require("bcrypt");

const seedUsers = async () => {
  try {
    const users = [
      {
        nombre: "Root",
        apellido: "System",
        cedula: "123456789",
        email: "root@system.com",
        password: "root123",
        rol: "administrador"
      },
      {
        nombre: "Admin",
        apellido: "System",
        cedula: "12345678",
        email: "admin@system.com",
        password: "admin",
        rol: "administrador"
      }
    ];

    for (const u of users) {
      const exists = await pool.query(
        "SELECT * FROM usuarios WHERE cedula = $1",
        [u.cedula]
      );

      if (exists.rows.length === 0) {
        const hash = await bcrypt.hash(u.password, 10);

        await pool.query(
          `INSERT INTO usuarios 
          (nombre, apellido, cedula, email, password, rol, activo)
          VALUES ($1,$2,$3,$4,$5,$6,true)`,
          [u.nombre, u.apellido, u.cedula, u.email, hash, u.rol]
        );

        console.log(`✔ Usuario seed creado: ${u.cedula}`);
      }
    }

  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedUsers;