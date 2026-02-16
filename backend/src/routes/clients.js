router.get("/clients", async (req, res) => {
    const conn = await pool;
    const result = await conn.request().query("SELECT * FROM Clientes");
    res.json(result.recordset);
});
