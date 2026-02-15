const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
try {
    const db = await pool;
    const result = await db.request().query('SELECT * FROM Agendamiento_citas');
    res.json(result.recordset);
} catch (err) {
    res.status(500).send(err.message);
}
});

router.post('/', async (req, res) => {
try {
    const {
    empleadoId,
    servicioId,
    fecha,
    horario,
    notas
    } = req.body;

    const db = await pool;

    await db.request()
    .input('empleadoId', empleadoId)
    .input('servicioId', servicioId)
    .input('fecha', fecha)
    .input('horario', horario)
    .input('notas', notas)
    .query(`
        INSERT INTO Agendamiento_citas
        (FK_id_empleado, FK_id_servicios, Fecha, Horario, Notas)
        VALUES
        (@empleadoId, @servicioId, @fecha, @horario, @notas)
    `);

    res.json({ message: "Cita creada correctamente" });

} catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
}
});





module.exports = router;
