const express = require("express");
const router = express.Router();
const { pool } = require("../db");

const COLORS = [
  "#78D1BD", "#60A5FA", "#FBBF24", "#F87171",
  "#A78BFA", "#EC4899", "#34D399", "#FB923C",
];

// GET /employees — todos los empleados activos
// specialty se deja vacío para que el frontend muestre todos sin filtrar
router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        PK_id_empleado              AS id,
        nombre + ' ' + apellido     AS name,
        ISNULL(especialidad, '')    AS specialty,
        correo,
        telefono,
        Estado                      AS estado
      FROM Empleado
      WHERE Estado = 'Activo'
      ORDER BY nombre
    `);

    const empleados = result.recordset.map((emp, idx) => ({
      ...emp,
      color: COLORS[idx % COLORS.length],
    }));

    res.json(empleados);

  } catch (error) {
    console.error("ERROR employees:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

module.exports = router;