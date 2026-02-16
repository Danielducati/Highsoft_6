router.get("/employees", async (req, res) => {
    const conn = await pool;
    const result = await conn.request().query("SELECT * FROM Empleados");
    res.json(result.recordset);
});
