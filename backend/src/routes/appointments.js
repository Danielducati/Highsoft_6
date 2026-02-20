// routes/appointments.js
const express = require("express");
const router = express.Router();
const sql = require("mssql"); // npm install mssql

// ─── Importa tu pool de conexión desde donde lo tengas configurado ───────────
// Ejemplo: const pool = require("../db");
// Si no tienes un archivo de conexión, usa el de abajo como referencia.

/*
// db.js (referencia - ajusta tus credenciales)
const sql = require("mssql");
const config = {
  user: "tu_usuario",
  password: "tu_contraseña",
  server: "localhost",         // o tu IP
  database: "highsoft_bd",
  options: {
    encrypt: false,            // true si usas Azure
    trustServerCertificate: true
  }
};
const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
module.exports = { pool, poolConnect, sql };
*/

const { pool, poolConnect } = require("../db"); // ajusta la ruta

// ─────────────────────────────────────────────────────────────────────────────
// GET /appointments
// Devuelve todas las citas con cliente, empleado y servicios del detalle
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT
        ac.PK_id_cita,
        -- Cliente
        c.PK_id_cliente                         AS cliente_id,
        c.nombre + ' ' + c.apellido             AS cliente_nombre,
        c.telefono                               AS cliente_telefono,
        -- Empleado principal de la cita
        e.PK_id_empleado                        AS empleado_id,
        e.nombre + ' ' + e.apellido             AS empleado_nombre,
        e.especialidad                           AS empleado_especialidad,
        -- Cita
        CONVERT(VARCHAR(10), ac.Fecha, 23)      AS Fecha,
        CONVERT(VARCHAR(5),  ac.Horario, 108)   AS Horario,
        ac.Estado,
        ac.Notas,
        -- Servicios del detalle (agrupados por cita)
        ad.PK_id_agendamiento_detalle           AS detalle_id,
        s.PK_id_servicio                        AS servicio_id,
        s.nombre                                AS servicio_nombre,
        s.Duracion                              AS servicio_duracion,
        ad.Precio                               AS servicio_precio,
        ad.Detalle                              AS servicio_detalle,
        -- Usuario/empleado asignado al detalle (puede diferir del empleado principal)
        u.PK_id_usuario                         AS detalle_usuario_id,
        emp_det.PK_id_empleado                  AS detalle_empleado_id,
        emp_det.nombre + ' ' + emp_det.apellido AS detalle_empleado_nombre
      FROM Agendamiento_citas ac
      LEFT JOIN Cliente   c        ON c.PK_id_cliente   = ac.FK_id_cliente
      LEFT JOIN Empleado  e        ON e.PK_id_empleado  = ac.FK_id_empleado
      LEFT JOIN Agendamiento_detalle ad ON ad.FK_id_agendamiento_cita = ac.PK_id_cita
      LEFT JOIN Servicio  s        ON s.PK_id_servicio  = ad.FK_id_servicios
      LEFT JOIN Usuarios  u        ON u.PK_id_usuario   = ad.FK_id_usuario
      LEFT JOIN Empleado  emp_det  ON emp_det.fk_id_usuario = ad.FK_id_usuario
      ORDER BY ac.Fecha DESC, ac.Horario DESC
    `);

    // Agrupar filas por cita (una fila por servicio del detalle → un objeto por cita)
    const citasMap = new Map();

    for (const row of result.recordset) {
      const id = row.PK_id_cita;

      if (!citasMap.has(id)) {
        citasMap.set(id, {
          PK_id_cita:        id,
          cliente_id:        row.cliente_id,
          cliente_nombre:    row.cliente_nombre   ?? "Sin cliente",
          cliente_telefono:  row.cliente_telefono ?? "",
          empleado_id:       row.empleado_id,
          empleado_nombre:   row.empleado_nombre  ?? "Sin empleado",
          Fecha:             row.Fecha,
          Horario:           row.Horario,
          Estado:            row.Estado,
          Notas:             row.Notas ?? "",
          servicios: [],
        });
      }

      // Agregar servicio si existe en el detalle
      if (row.detalle_id) {
        citasMap.get(id).servicios.push({
          serviceId:     String(row.servicio_id),
          serviceName:   row.servicio_nombre    ?? "Servicio",
          employeeId:    String(row.detalle_empleado_id ?? row.empleado_id),
          employeeName:  row.detalle_empleado_nombre ?? row.empleado_nombre ?? "Empleado",
          duration:      row.servicio_duracion  ?? 60,
          price:         row.servicio_precio,
          startTime:     row.Horario,           // el frontend recalcula los siguientes
        });
      }

      // Si no hay detalle, agrega un servicio vacío para que el frontend no falle
      const cita = citasMap.get(id);
      if (cita.servicios.length === 0) {
        cita.servicios.push({
          serviceId:    "",
          serviceName:  "Sin servicio asignado",
          employeeId:   String(row.empleado_id),
          employeeName: row.empleado_nombre ?? "Empleado",
          duration:     60,
          startTime:    row.Horario,
        });
      }
    }

    res.json([...citasMap.values()]);
  } catch (err) {
    console.error("Error GET /appointments:", err);
    res.status(500).json({ error: "Error al obtener citas", detalle: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /appointments/:id  — Una sola cita
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT
          ac.PK_id_cita,
          c.PK_id_cliente                         AS cliente_id,
          c.nombre + ' ' + c.apellido             AS cliente_nombre,
          c.telefono                               AS cliente_telefono,
          e.PK_id_empleado                        AS empleado_id,
          e.nombre + ' ' + e.apellido             AS empleado_nombre,
          CONVERT(VARCHAR(10), ac.Fecha,   23)    AS Fecha,
          CONVERT(VARCHAR(5),  ac.Horario, 108)   AS Horario,
          ac.Estado,
          ac.Notas,
          ad.PK_id_agendamiento_detalle           AS detalle_id,
          s.PK_id_servicio                        AS servicio_id,
          s.nombre                                AS servicio_nombre,
          s.Duracion                              AS servicio_duracion,
          ad.Precio                               AS servicio_precio,
          emp_det.PK_id_empleado                  AS detalle_empleado_id,
          emp_det.nombre + ' ' + emp_det.apellido AS detalle_empleado_nombre
        FROM Agendamiento_citas ac
        LEFT JOIN Cliente   c        ON c.PK_id_cliente   = ac.FK_id_cliente
        LEFT JOIN Empleado  e        ON e.PK_id_empleado  = ac.FK_id_empleado
        LEFT JOIN Agendamiento_detalle ad ON ad.FK_id_agendamiento_cita = ac.PK_id_cita
        LEFT JOIN Servicio  s        ON s.PK_id_servicio  = ad.FK_id_servicios
        LEFT JOIN Usuarios  u        ON u.PK_id_usuario   = ad.FK_id_usuario
        LEFT JOIN Empleado  emp_det  ON emp_det.fk_id_usuario = ad.FK_id_usuario
        WHERE ac.PK_id_cita = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: "Cita no encontrada" });

    const row0 = result.recordset[0];
    const cita = {
      PK_id_cita:       row0.PK_id_cita,
      cliente_id:       row0.cliente_id,
      cliente_nombre:   row0.cliente_nombre,
      cliente_telefono: row0.cliente_telefono,
      empleado_id:      row0.empleado_id,
      empleado_nombre:  row0.empleado_nombre,
      Fecha:            row0.Fecha,
      Horario:          row0.Horario,
      Estado:           row0.Estado,
      Notas:            row0.Notas,
      servicios: result.recordset
        .filter(r => r.detalle_id)
        .map(r => ({
          serviceId:    String(r.servicio_id),
          serviceName:  r.servicio_nombre,
          employeeId:   String(r.detalle_empleado_id ?? row0.empleado_id),
          employeeName: r.detalle_empleado_nombre ?? row0.empleado_nombre,
          duration:     r.servicio_duracion ?? 60,
          startTime:    row0.Horario,
        })),
    };

    res.json(cita);
  } catch (err) {
    console.error("Error GET /appointments/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments  — Crear cita + detalle
// Body: { cliente, empleado_principal, fecha, hora, notas, servicios: [{servicio, empleado_usuario, precio}] }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { cliente, empleado_principal, fecha, hora, notas, servicios } = req.body;

  if (!empleado_principal || !fecha || !hora) {
    return res.status(400).json({ error: "empleado_principal, fecha y hora son requeridos" });
  }

  try {
    await poolConnect;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Insertar encabezado de la cita
      const citaResult = await transaction.request()
        .input("empleado",  sql.Int,         empleado_principal)
        .input("cliente",   sql.Int,         cliente ?? null)
        .input("fecha",     sql.Date,        new Date(fecha))
        .input("horario",   sql.VarChar(8),  hora)
        .input("notas",     sql.VarChar(300), notas ?? null)
        .query(`
          INSERT INTO Agendamiento_citas (FK_id_empleado, FK_id_cliente, Horario, Fecha, Estado, Notas)
          OUTPUT INSERTED.PK_id_cita
          VALUES (@empleado, @cliente, @horario, @fecha, 'Pendiente', @notas)
        `);

      const citaId = citaResult.recordset[0].PK_id_cita;

      // 2. Insertar detalle por cada servicio
      if (Array.isArray(servicios) && servicios.length > 0) {
        for (const s of servicios) {
          await transaction.request()
            .input("cita",     sql.Int,          citaId)
            .input("servicio", sql.Int,          s.servicio)
            .input("usuario",  sql.Int,          s.empleado_usuario ?? null)
            .input("precio",   sql.Decimal(10,2), s.precio ?? null)
            .input("detalle",  sql.VarChar(500), s.detalle ?? null)
            .query(`
              INSERT INTO Agendamiento_detalle (FK_id_agendamiento_cita, FK_id_servicios, FK_id_usuario, Precio, Detalle)
              VALUES (@cita, @servicio, @usuario, @precio, @detalle)
            `);
        }
      }

      await transaction.commit();
      res.status(201).json({ ok: true, PK_id_cita: citaId });

    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error("Error POST /appointments:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/appointments/:id  — Editar cita
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { cliente, empleado_principal, fecha, hora, notas, servicios } = req.body;
  const citaId = Number(req.params.id);

  try {
    await poolConnect;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Actualizar encabezado
      await transaction.request()
        .input("id",       sql.Int,         citaId)
        .input("empleado", sql.Int,         empleado_principal)
        .input("cliente",  sql.Int,         cliente ?? null)
        .input("fecha",    sql.Date,        new Date(fecha))
        .input("horario",  sql.VarChar(8),  hora)
        .input("notas",    sql.VarChar(300), notas ?? null)
        .query(`
          UPDATE Agendamiento_citas
          SET FK_id_empleado = @empleado,
              FK_id_cliente  = @cliente,
              Fecha          = @fecha,
              Horario        = @horario,
              Notas          = @notas
          WHERE PK_id_cita = @id
        `);

      // Reemplazar detalle: borrar y reinsertar
      await transaction.request()
        .input("cita", sql.Int, citaId)
        .query(`DELETE FROM Agendamiento_detalle WHERE FK_id_agendamiento_cita = @cita`);

      if (Array.isArray(servicios) && servicios.length > 0) {
        for (const s of servicios) {
          await transaction.request()
            .input("cita",     sql.Int,          citaId)
            .input("servicio", sql.Int,          s.servicio)
            .input("usuario",  sql.Int,          s.empleado_usuario ?? null)
            .input("precio",   sql.Decimal(10,2), s.precio ?? null)
            .input("detalle",  sql.VarChar(500), s.detalle ?? null)
            .query(`
              INSERT INTO Agendamiento_detalle (FK_id_agendamiento_cita, FK_id_servicios, FK_id_usuario, Precio, Detalle)
              VALUES (@cita, @servicio, @usuario, @precio, @detalle)
            `);
        }
      }

      await transaction.commit();
      res.json({ ok: true });

    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error("Error PUT /appointments/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/appointments/:id/status  — Cambiar estado
// Body: { status: "pending" | "completed" | "cancelled" }
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;

  // Normalizar a los valores que usa SQL Server
  const estadoMap = {
    pending:   "Pendiente",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  const estadoDB = estadoMap[status];
  if (!estadoDB) return res.status(400).json({ error: "Estado inválido" });

  try {
    await poolConnect;
    await pool.request()
      .input("id",     sql.Int,        Number(req.params.id))
      .input("estado", sql.VarChar(30), estadoDB)
      .query(`UPDATE Agendamiento_citas SET Estado = @estado WHERE PK_id_cita = @id`);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error PATCH /appointments/:id/status:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/appointments/:id/cancel  — Cancelar (alias de status)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/cancel", async (req, res) => {
  try {
    await poolConnect;
    await pool.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`UPDATE Agendamiento_citas SET Estado = 'Cancelada' WHERE PK_id_cita = @id`);

    res.json({ ok: true });
  } catch (err) {
    console.error("Error PATCH /appointments/:id/cancel:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id  — Eliminar cita y su detalle
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const citaId = Number(req.params.id);
  try {
    await poolConnect;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Primero el detalle (FK), luego el encabezado
      await transaction.request()
        .input("cita", sql.Int, citaId)
        .query(`DELETE FROM Agendamiento_detalle WHERE FK_id_agendamiento_cita = @cita`);

      await transaction.request()
        .input("id", sql.Int, citaId)
        .query(`DELETE FROM Agendamiento_citas WHERE PK_id_cita = @id`);

      await transaction.commit();
      res.json({ ok: true });

    } catch (innerErr) {
      await transaction.rollback();
      throw innerErr;
    }
  } catch (err) {
    console.error("Error DELETE /appointments/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;