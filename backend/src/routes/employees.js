const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        PK_id_empleado AS id,
        Nombre,
        Apellido
      FROM Empleado
      ORDER BY Nombre
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error("ERROR employees:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

module.exports = router;
