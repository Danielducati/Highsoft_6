const express = require("express");
const router = express.Router();
const { pool, sql } = require("../db");

// ─────────────────────────────────────────────────────────────────────────────
// GET /appointments
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const connection = await pool;
    const result = await connection.request().query(`
      SELECT
        ac.PK_id_cita,
        c.PK_id_cliente                         AS cliente_id,
        c.nombre + ' ' + c.apellido             AS cliente_nombre,
        ISNULL(c.telefono, '')                  AS cliente_telefono,
        e.PK_id_empleado                        AS empleado_id,
        e.nombre + ' ' + e.apellido             AS empleado_nombre,
        CONVERT(VARCHAR(10), ac.Fecha, 23)      AS Fecha,
        CONVERT(VARCHAR(5),  ac.Horario, 108)   AS Horario,
        ac.Estado,
        ISNULL(ac.Notas, '')                    AS Notas,
        ad.PK_id_agendamiento_detalle           AS detalle_id,
        s.PK_id_servicio                        AS servicio_id,
        s.nombre                                AS servicio_nombre,
        ISNULL(s.Duracion, 60)                  AS servicio_duracion,
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
      ORDER BY ac.Fecha DESC, ac.Horario DESC
    `);

    const citasMap = new Map();
    for (const row of result.recordset) {
      const id = row.PK_id_cita;
      if (!citasMap.has(id)) {
        citasMap.set(id, {
          PK_id_cita:       id,
          cliente_id:       row.cliente_id,
          cliente_nombre:   row.cliente_nombre  ?? "Sin cliente",
          cliente_telefono: row.cliente_telefono ?? "",
          empleado_id:      row.empleado_id,
          empleado_nombre:  row.empleado_nombre  ?? "Sin empleado",
          Fecha:            row.Fecha,
          Horario:          row.Horario,
          Estado:           row.Estado,
          Notas:            row.Notas ?? "",
          servicios:        [],
        });
      }
      if (row.detalle_id) {
        citasMap.get(id).servicios.push({
          serviceId:    String(row.servicio_id),
          serviceName:  row.servicio_nombre             ?? "Servicio",
          employeeId:   String(row.detalle_empleado_id  ?? row.empleado_id),
          employeeName: row.detalle_empleado_nombre     ?? row.empleado_nombre ?? "Empleado",
          duration:     row.servicio_duracion           ?? 60,
          price:        row.servicio_precio,
          startTime:    row.Horario,
        });
      }
      const cita = citasMap.get(id);
      if (cita.servicios.length === 0) {
        cita.servicios.push({
          serviceId:    "",
          serviceName:  "Sin servicio",
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
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /appointments/:id
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const connection = await pool;
    const result = await connection.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`
        SELECT
          ac.PK_id_cita,
          c.PK_id_cliente                         AS cliente_id,
          c.nombre + ' ' + c.apellido             AS cliente_nombre,
          ISNULL(c.telefono, '')                  AS cliente_telefono,
          e.PK_id_empleado                        AS empleado_id,
          e.nombre + ' ' + e.apellido             AS empleado_nombre,
          CONVERT(VARCHAR(10), ac.Fecha,   23)    AS Fecha,
          CONVERT(VARCHAR(5),  ac.Horario, 108)   AS Horario,
          ac.Estado,
          ISNULL(ac.Notas, '')                    AS Notas,
          ad.PK_id_agendamiento_detalle           AS detalle_id,
          s.PK_id_servicio                        AS servicio_id,
          s.nombre                                AS servicio_nombre,
          ISNULL(s.Duracion, 60)                  AS servicio_duracion,
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

    if (result.recordset.length === 0)
      return res.status(404).json({ error: "Cita no encontrada" });

    const row0 = result.recordset[0];
    res.json({
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
    });
  } catch (err) {
    console.error("Error GET /appointments/:id:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/appointments
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { cliente, fecha, hora, notas, servicios } = req.body;

  if (!fecha || !hora || !Array.isArray(servicios) || servicios.length === 0) {
    return res.status(400).json({ error: "fecha, hora y al menos un servicio son requeridos" });
  }

  // Validar que la fecha no sea pasada
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaCita = new Date(fecha);
  if (fechaCita < hoy) {
    return res.status(400).json({ error: "No se pueden crear citas en fechas pasadas" });
  }
  
  const empleado_principal = Number(servicios[0].empleado_usuario);
  if (!empleado_principal) {
    return res.status(400).json({ error: "El primer servicio debe tener un empleado" });
  }

  try {
    const connection = await pool;
    const transaction = new sql.Transaction(connection);
    await transaction.begin();

    try {
      // 1. Insertar cita
      const citaResult = await new sql.Request(transaction)
        .input("empleado", sql.Int,          empleado_principal)
        .input("cliente",  sql.Int,          cliente ? Number(cliente) : null)
        .input("fecha",    sql.Date,         new Date(fecha))
        .input("horario",  sql.VarChar(8),   hora)
        .input("notas",    sql.VarChar(300), notas ?? null)
        .query(`
          INSERT INTO Agendamiento_citas (FK_id_empleado, FK_id_cliente, Horario, Fecha, Estado, Notas)
          OUTPUT INSERTED.PK_id_cita
          VALUES (@empleado, @cliente, @horario, @fecha, 'Pendiente', @notas)
        `);

      const citaId = citaResult.recordset[0].PK_id_cita;

      // 2. Insertar detalle por cada servicio
      for (const s of servicios) {
        const servicioId = Number(s.servicio);
        const empId      = Number(s.empleado_usuario);

        // Obtener fk_id_usuario del empleado
        let usuarioId = null;
        if (empId) {
          const userRes = await new sql.Request(transaction)
            .input("empId", sql.Int, empId)
            .query(`SELECT fk_id_usuario FROM Empleado WHERE PK_id_empleado = @empId`);
          if (userRes.recordset.length > 0) {
            usuarioId = userRes.recordset[0].fk_id_usuario;
          }
        }

        await new sql.Request(transaction)
          .input("cita",     sql.Int,           citaId)
          .input("servicio", sql.Int,           servicioId)
          .input("usuario",  sql.Int,           usuarioId)
          .input("precio",   sql.Decimal(10,2), s.precio ?? null)
          .input("detalle",  sql.VarChar(500),  s.detalle ?? null)
          .query(`
            INSERT INTO Agendamiento_detalle (FK_id_agendamiento_cita, FK_id_servicios, FK_id_usuario, Precio, Detalle)
            VALUES (@cita, @servicio, @usuario, @precio, @detalle)
          `);

        // 3. Registrar en Empleado_Servicio si no existe
        if (empId) {
          await new sql.Request(transaction)
            .input("empId", sql.Int, empId)
            .input("srvId", sql.Int, servicioId)
            .query(`
              IF NOT EXISTS (
                SELECT 1 FROM Empleado_Servicio 
                WHERE FK_id_empleado = @empId AND FK_id_servicio = @srvId
              )
              INSERT INTO Empleado_Servicio (FK_id_empleado, FK_id_servicio)
              VALUES (@empId, @srvId)
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
// PUT /api/appointments/:id
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  const { cliente, fecha, hora, notas, servicios } = req.body;
  const citaId = Number(req.params.id);

  try {
    const connection = await pool;
    const transaction = new sql.Transaction(connection);
    await transaction.begin();

    try {
      const empleado_principal = Array.isArray(servicios) && servicios.length > 0
        ? Number(servicios[0].empleado_usuario)
        : null;

      await new sql.Request(transaction)
        .input("id",       sql.Int,          citaId)
        .input("empleado", sql.Int,          empleado_principal)
        .input("cliente",  sql.Int,          cliente ? Number(cliente) : null)
        .input("fecha",    sql.Date,         new Date(fecha))
        .input("horario",  sql.VarChar(8),   hora)
        .input("notas",    sql.VarChar(300), notas ?? null)
        .query(`
          UPDATE Agendamiento_citas
          SET FK_id_empleado = @empleado, FK_id_cliente = @cliente,
              Fecha = @fecha, Horario = @horario, Notas = @notas
          WHERE PK_id_cita = @id
        `);

      await new sql.Request(transaction)
        .input("cita", sql.Int, citaId)
        .query(`DELETE FROM Agendamiento_detalle WHERE FK_id_agendamiento_cita = @cita`);

      if (Array.isArray(servicios)) {
        for (const s of servicios) {
          const empId = Number(s.empleado_usuario);
          let usuarioId = null;
          if (empId) {
            const userRes = await new sql.Request(transaction)
              .input("empId", sql.Int, empId)
              .query(`SELECT fk_id_usuario FROM Empleado WHERE PK_id_empleado = @empId`);
            if (userRes.recordset.length > 0) usuarioId = userRes.recordset[0].fk_id_usuario;
          }
          await new sql.Request(transaction)
            .input("cita",     sql.Int,           citaId)
            .input("servicio", sql.Int,           Number(s.servicio))
            .input("usuario",  sql.Int,           usuarioId)
            .input("precio",   sql.Decimal(10,2), s.precio ?? null)
            .input("detalle",  sql.VarChar(500),  s.detalle ?? null)
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
// PATCH /api/appointments/:id/status
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
  const estadoMap = { pending: "Pendiente", completed: "Completada", cancelled: "Cancelada" };
  const estadoDB = estadoMap[req.body.status];
  if (!estadoDB) return res.status(400).json({ error: "Estado inválido" });

  try {
    const connection = await pool;
    await connection.request()
      .input("id",     sql.Int,         Number(req.params.id))
      .input("estado", sql.VarChar(30), estadoDB)
      .query(`UPDATE Agendamiento_citas SET Estado = @estado WHERE PK_id_cita = @id`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error PATCH status:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/appointments/:id/cancel
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id/cancel", async (req, res) => {
  try {
    const connection = await pool;
    await connection.request()
      .input("id", sql.Int, Number(req.params.id))
      .query(`UPDATE Agendamiento_citas SET Estado = 'Cancelada' WHERE PK_id_cita = @id`);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error PATCH cancel:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/appointments/:id
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const citaId = Number(req.params.id);
  try {
    const connection = await pool;
    const transaction = new sql.Transaction(connection);
    await transaction.begin();
    try {
      await new sql.Request(transaction)
        .input("cita", sql.Int, citaId)
        .query(`DELETE FROM Agendamiento_detalle WHERE FK_id_agendamiento_cita = @cita`);
      await new sql.Request(transaction)
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