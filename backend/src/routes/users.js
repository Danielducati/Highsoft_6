const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        PK_id_usuario AS id,
        Correo,
        contrasena,
        estado,
        FK_id_rol AS rol
      FROM Usuarios
      WHERE estado = 'Activo'
      ORDER BY Correo
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error("ERROR users:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

module.exports = router;
