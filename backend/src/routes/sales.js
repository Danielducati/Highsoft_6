const express = require("express");
const router = express.Router();
const { pool, sql } = require("../db");


// ==========================================
// GET → OBTENER VENTAS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const connection = await pool;

    const result = await connection.request().query(`
      SELECT 
        ve.PK_id_venta_encabezado AS id,
        c.Nombre AS Cliente,
        s.Nombre AS Servicio,
        vd.Cantidad,
        vd.Precio,
        vd.Subtotal,
        ve.metodo_pago,
        ve.descuento,
        ve.Total,
        ve.Iva,
        ve.Fecha,
        ve.Estado
      FROM Venta_encabezado ve
      LEFT JOIN Cliente c ON ve.FK_id_cliente = c.PK_id_cliente
      LEFT JOIN Venta_detalle vd ON vd.FK_id_venta_encabezado = ve.PK_id_venta_encabezado
      LEFT JOIN Servicio s ON vd.FK_id_servicio = s.PK_id_servicio
      ORDER BY ve.Fecha DESC
    `);

    res.json(result.recordset);

  } catch (error) {
    console.error("ERROR ventas:", error);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});


// ==========================================
// POST → CREAR VENTA (cita o directa)
// ==========================================
router.post("/", async (req, res) => {
  try {
    const {
      tipo, // "cita" o "directa"
      id_cita,
      nombre_cliente,
      id_servicio,
      metodo_pago,
      descuento = 0,
      cantidad = 1
    } = req.body;

    const connection = await pool;

    let id_cliente;
    let servicio_id;
    let precio;

    // =========================
    // VENTA DESDE CITA
    // =========================
    if (tipo === "cita") {
      const cita = await connection.request()
        .input("id_cita", sql.Int, id_cita)
        .query(`
          SELECT c.FK_id_cliente, c.FK_id_servicio, s.precio
          FROM Agendamiento c
          JOIN Servicio s ON c.FK_id_servicio = s.PK_id_servicio
          WHERE c.PK_id_agendamiento = @id_cita AND c.estado = 'Activa'
        `);

      if (cita.recordset.length === 0) {
        return res.status(404).json({ error: "Cita no encontrada o no activa" });
      }

      id_cliente = cita.recordset[0].FK_id_cliente;
      servicio_id = cita.recordset[0].FK_id_servicio;
      precio = cita.recordset[0].precio;

      await connection.request()
        .input("id_cita", sql.Int, id_cita)
        .query(`
          UPDATE Agendamiento SET estado = 'Finalizada'
          WHERE PK_id_agendamiento = @id_cita
        `);
    }

    // =========================
    // VENTA DIRECTA
    // =========================
    if (tipo === "directa") {
      const cliente = await connection.request()
        .input("nombre", sql.VarChar, nombre_cliente)
        .query(`
          INSERT INTO Cliente (Nombre)
          OUTPUT INSERTED.PK_id_cliente
          VALUES (@nombre)
        `);

      id_cliente = cliente.recordset[0].PK_id_cliente;
      servicio_id = id_servicio;

      const servicio = await connection.request()
        .input("id_servicio", sql.Int, id_servicio)
        .query(`
          SELECT precio FROM Servicio
          WHERE PK_id_servicio = @id_servicio
        `);

      precio = servicio.recordset[0].precio;
    }

    const subtotal = precio * cantidad;
    const iva = subtotal * 0.19; // 19% IVA, ajusta si es diferente
    const total = subtotal + iva - descuento;

    // Insertar encabezado
    const encabezado = await connection.request()
      .input("id_cliente", sql.Int, id_cliente)
      .input("id_cita", sql.Int, id_cita || null)
      .input("metodo_pago", sql.VarChar, metodo_pago)
      .input("descuento", sql.Decimal(10,2), descuento)
      .input("iva", sql.Decimal(10,2), iva)
      .input("total", sql.Decimal(12,2), total)
      .query(`
        INSERT INTO Venta_encabezado (FK_id_cliente, FK_id_cita, metodo_pago, descuento, Iva, Total, Estado)
        OUTPUT INSERTED.*
        VALUES (@id_cliente, @id_cita, @metodo_pago, @descuento, @iva, @total, 'Activo')
      `);

    const id_venta = encabezado.recordset[0].PK_id_venta_encabezado;

    // Insertar detalle
    const detalle = await connection.request()
      .input("id_venta", sql.Int, id_venta)
      .input("id_servicio", sql.Int, servicio_id)
      .input("cantidad", sql.Int, cantidad)
      .input("precio", sql.Decimal(12,2), precio)
      .input("subtotal", sql.Decimal(12,2), subtotal)
      .query(`
        INSERT INTO Venta_detalle (FK_id_venta_encabezado, FK_id_servicio, Cantidad, Precio, Subtotal)
        OUTPUT INSERTED.*
        VALUES (@id_venta, @id_servicio, @cantidad, @precio, @subtotal)
      `);

    res.json({
      encabezado: encabezado.recordset[0],
      detalle: detalle.recordset[0]
    });

  } catch (error) {
    console.error("ERROR crear venta:", error);
    res.status(500).json({ error: "Error al crear venta" });
  }
});

module.exports = router;