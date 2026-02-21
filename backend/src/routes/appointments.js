const express = require("express");
const router = express.Router();
const { pool } = require("../db");

// GET /appointments
router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        c.PK_id_cita AS id,
        cl.nombre AS cliente,
        cl.telefono,
        s.nombre AS servicio,
        s.duracion,
        e.nombre + ' ' + e.apellido AS empleado,
        c.Fecha,
        c.Horario,
        c.Estado,
        c.Notas
      FROM Agendamiento_citas c
      INNER JOIN Cliente cl 
        ON c.FK_id_cliente = cl.PK_id_cliente
      INNER JOIN Servicio s 
        ON c.FK_id_servicios = s.PK_id_servicio
      INNER JOIN Empleado e 
        ON c.FK_id_empleado = e.PK_id_empleado
      ORDER BY c.Fecha, c.Horario
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
