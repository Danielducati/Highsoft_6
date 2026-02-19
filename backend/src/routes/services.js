const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request().query(`
    SELECT 
        PK_id_servicio AS id,
        nombre,
        Precio
    FROM Servicio
    ORDER BY nombre
    `);

    res.json(result.recordset);

} catch (error) {
    console.error("ERROR services:", error);
    res.status(500).json({ error: "Error al obtener servicios" });
}
});

module.exports = router;
