const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /services — devuelve los campos que espera el frontend
router.get("/", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request().query(`
    SELECT 
        s.PK_id_servicio          AS id,
        s.nombre                  AS name,
        cs.Nombre                 AS category,
        ISNULL(s.Duracion, 60)    AS duration,
        ISNULL(s.Precio, 0)       AS price,
        s.descripcion,
        s.Estado                  AS estado
    FROM Servicio s
    LEFT JOIN Categoria_servicios cs ON cs.PK_id_categoria_servicios = s.FK_categoria_servicios
    WHERE s.Estado = 'Activo'
    ORDER BY s.nombre
    `);

    res.json(result.recordset);

} catch (error) {
    console.error("ERROR services:", error);
    res.status(500).json({ error: "Error al obtener servicios" });
}
});

module.exports = router;