const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /appointments
router.get("/", async (req, res) => {
try {
    const connection = await pool;

    const result = await connection.request().query(`
    SELECT
        PK_id_cita,
        FK_id_empleado,
        FK_id_servicios,
        Fecha,
        Horario,
        Estado,
        Notas
    FROM Agendamiento_citas
    ORDER BY Fecha, Horario
    `);

    res.json(result.recordset);

} catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({ error: "Error al obtener citas" });
}
});



// POST /appointments
router.post("/", async (req, res) => {
try {
    const { empleado, servicio, fecha, hora } = req.body;

    const connection = await pool;

    await connection.request()
    .input("empleado", empleado)
    .input("servicio", servicio)
    .input("fecha", fecha)
    .input("hora", hora)
    .query(`
        INSERT INTO Agendamiento_citas
        (FK_id_empleado, FK_id_servicios, Fecha, Horario)
        VALUES (@empleado, @servicio, @fecha, @hora)
    `);

    res.json({ message: "Cita creada ✅" });

} catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar cita" });
}
});

module.exports = router;
