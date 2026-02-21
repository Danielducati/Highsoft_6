const sql = require('mssql');
require('dotenv').config();

const config = {
  user: 'SamuelGP',
  password: 'admin123',
  server: 'localhost',
  database: 'highsoft_bd',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};
const pool = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Conectado a SQL Server");
    return pool;
  })
  .catch(err => console.error("❌ Error DB:", err));

module.exports = { sql, pool };
