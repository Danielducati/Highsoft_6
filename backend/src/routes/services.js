const express = require("express");
const router = express.Router();
const { pool, sql } = require("../db");


// ==========================================
// GET → OBTENER TODOS LOS SERVICIOS
// ==========================================
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
        s.imagen_servicio         AS imagen,
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


// ==========================================
// GET → OBTENER UN SERVICIO POR ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT 
          s.PK_id_servicio          AS id,
          s.nombre                  AS name,
          s.FK_categoria_servicios  AS id_categoria,
          cs.Nombre                 AS category,
          ISNULL(s.Duracion, 60)    AS duration,
          ISNULL(s.Precio, 0)       AS price,
          s.descripcion,
          s.imagen_servicio         AS imagen,
          s.Estado                  AS estado
        FROM Servicio s
        LEFT JOIN Categoria_servicios cs ON cs.PK_id_categoria_servicios = s.FK_categoria_servicios
        WHERE s.PK_id_servicio = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("ERROR servicio:", error);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
});


// ==========================================
// POST → CREAR SERVICIO
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, Duracion, Precio, FK_categoria_servicios, imagen_servicio, Estado = "Activo" } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const connection = await pool;

    const result = await connection.request()
      .input("nombre", sql.VarChar(100), nombre)
      .input("descripcion", sql.VarChar(600), descripcion)
      .input("Duracion", sql.Int, Duracion)
      .input("Precio", sql.Decimal(10, 2), Precio)
      .input("FK_categoria_servicios", sql.Int, FK_categoria_servicios)
      .input("imagen_servicio", sql.VarChar(500), imagen_servicio)
      .input("Estado", sql.VarChar(30), Estado)
      .query(`
        INSERT INTO Servicio (nombre, descripcion, Duracion, Precio, FK_categoria_servicios, imagen_servicio, Estado)
        OUTPUT INSERTED.*
        VALUES (@nombre, @descripcion, @Duracion, @Precio, @FK_categoria_servicios, @imagen_servicio, @Estado)
      `);

    res.status(201).json(result.recordset[0]);

  } catch (error) {
    console.error("ERROR crear servicio:", error);
    res.status(500).json({ error: "Error al crear servicio" });
  }
});


// ==========================================
// PUT → ACTUALIZAR SERVICIO
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { nombre, descripcion, Duracion, Precio, FK_categoria_servicios, imagen_servicio, Estado } = req.body;

    const connection = await pool;

    const result = await connection.request()
      .input("id", sql.Int, req.params.id)
      .input("nombre", sql.VarChar(100), nombre)
      .input("descripcion", sql.VarChar(600), descripcion)
      .input("Duracion", sql.Int, Duracion)
      .input("Precio", sql.Decimal(10, 2), Precio)
      .input("FK_categoria_servicios", sql.Int, FK_categoria_servicios)
      .input("imagen_servicio", sql.VarChar(500), imagen_servicio)
      .input("Estado", sql.VarChar(30), Estado)
      .query(`
        UPDATE Servicio
        SET nombre = @nombre,
            descripcion = @descripcion,
            Duracion = @Duracion,
            Precio = @Precio,
            FK_categoria_servicios = @FK_categoria_servicios,
            imagen_servicio = @imagen_servicio,
            Estado = @Estado
        OUTPUT INSERTED.*
        WHERE PK_id_servicio = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error("ERROR actualizar servicio:", error);
    res.status(500).json({ error: "Error al actualizar servicio" });
  }
});


// ==========================================
// DELETE → DESACTIVAR SERVICIO (soft delete)
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        UPDATE Servicio
        SET Estado = 'Inactivo'
        OUTPUT INSERTED.*
        WHERE PK_id_servicio = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json({ mensaje: "Servicio desactivado correctamente", data: result.recordset[0] });

  } catch (error) {
    console.error("ERROR eliminar servicio:", error);
    res.status(500).json({ error: "Error al eliminar servicio" });
  }
});


module.exports = router;