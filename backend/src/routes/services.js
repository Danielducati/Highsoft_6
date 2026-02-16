router.get("/services", async (req, res) => {
    const conn = await pool;
    const result = await conn.request().query("SELECT * FROM Servicios");
    res.json(result.recordset);
});
