const { Pool } = require("pg");

console.log("ENV CHECK:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  NODE_ENV: process.env.NODE_ENV,
});

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 5432),
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("🔥 DB CONNECTED OK");
});

pool.query("SELECT NOW()")
  .then(res => {
    console.log("🔥 DB TEST OK:", res.rows[0]);
  })
  .catch(err => {
    console.log("❌ DB TEST ERROR:", err.message);
  });

module.exports = pool;