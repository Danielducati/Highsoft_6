const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { pool } = require("../db");

// GET /clients — devuelve los campos que espera el frontend
router.get("/", async (req, res) => {
try {
    const connection = await pool;
    const result = await connection.request().query(`
    SELECT 
        PK_id_cliente                     AS id,
        nombre + ' ' + apellido           AS name,
        ISNULL(telefono, '')              AS phone,
        correo,
        tipo_documento,
        numero_documento,
        direccion,
        foto_perfil,
        Estado                            AS estado
    FROM Cliente
    WHERE Estado = 'Activo'
    ORDER BY nombre
    `);
    res.json(result.recordset);
} catch (error) {
    console.error("ERROR clients:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
}
});

// POST /clients/register — sin cambios, funciona igual
router.post("/register", async (req, res) => {
const transaction = new sql.Transaction(await pool);
try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    const {
    nombre, apellido, tipo_documento, numero_documento,
    correo, telefono, direccion, foto_perfil, estado, password
    } = req.body;

    // 1. Crear usuario
    const userResult = await request
    .input("correo",   correo)
    .input("password", password)
    .input("estado",   "Activo")
    .input("rol",      2)
    .query(`
        INSERT INTO Usuarios (correo, contrasena, estado, FK_id_rol)
        OUTPUT INSERTED.PK_id_usuario
        VALUES (@correo, @password, @estado, @rol)
    `);

    const userId = userResult.recordset[0].PK_id_usuario;

    // 2. Crear cliente
    await request
    .input("nombre",           nombre)
    .input("apellido",         apellido)
    .input("tipo_documento",   tipo_documento)
    .input("numero_documento", numero_documento)
    .input("correoCliente",    correo)
    .input("telefono",         telefono)
    .input("direccion",        direccion)
    .input("foto_perfil",      foto_perfil)
    .input("estadoCliente",    estado)
    .input("fk_id_usuario",    userId)
    .query(`
        INSERT INTO Cliente
        (nombre, apellido, tipo_documento, numero_documento, correo,
        telefono, direccion, foto_perfil, estado, fk_id_usuario)
        VALUES
        (@nombre, @apellido, @tipo_documento, @numero_documento, @correoCliente,
        @telefono, @direccion, @foto_perfil, @estadoCliente, @fk_id_usuario)
    `);

    await transaction.commit();
    res.status(201).json({ message: "Cliente registrado correctamente" });

} catch (error) {
    await transaction.rollback();
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Error al registrar cliente" });
}
});

module.exports = router;