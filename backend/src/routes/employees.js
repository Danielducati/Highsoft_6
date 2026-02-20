const express = require("express");
const router = express.Router();
const { pool } = require("../db");

const COLORS = [
  "#78D1BD", "#60A5FA", "#FBBF24", "#F87171",
  "#A78BFA", "#EC4899", "#34D399", "#FB923C",
];

// GET /employees
// Trae empleados con las categorías reales de sus servicios asignados
// via Empleado_Servicio → Servicio → Categoria_servicios
router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        e.PK_id_empleado              AS id,
        e.nombre + ' ' + e.apellido   AS name,
        e.correo,
        e.telefono,
        e.Estado                      AS estado,
        ISNULL(
          (
            SELECT DISTINCT cs.Nombre + ','
            FROM Empleado_Servicio es2
            JOIN Servicio s2
              ON s2.PK_id_servicio = es2.FK_id_servicio
            JOIN Categoria_servicios cs
              ON cs.PK_id_categoria_servicios = s2.FK_categoria_servicios
            WHERE es2.FK_id_empleado = e.PK_id_empleado
            FOR XML PATH('')
          ),
          ISNULL(e.especialidad, 'General')
        ) AS specialty
      FROM Empleado e
      WHERE e.Estado = 'Activo'
      ORDER BY e.nombre
    `);

    const empleados = result.recordset.map((emp, idx) => ({
      ...emp,
      specialty: emp.specialty ? emp.specialty.replace(/,\s*$/, "").trim() : "General",
      color: COLORS[idx % COLORS.length],
    }));

    res.json(empleados);

  } catch (error) {
    console.error("ERROR employees:", error);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

module.exports = router;