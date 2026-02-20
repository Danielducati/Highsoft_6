const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const appointmentRoutes = require('./routes/appointments.js');
const employeeRoutes    = require('./routes/employees.js');
const serviceRoutes     = require('./routes/services.js');
const clientRoutes      = require('./routes/clients.js');
const rolesRoutes       = require('./routes/roles.js');

// Rutas GET (lectura — las usa el frontend para cargar datos)
app.use('/appointments', appointmentRoutes);
app.use('/employees',    employeeRoutes);
app.use('/services',     serviceRoutes);
app.use('/clients',      clientRoutes);
app.use('/roles',        rolesRoutes);

// Rutas de escritura (POST, PUT, PATCH, DELETE)
// Usamos el mismo router pero bajo /api/appointments
app.use('/api/appointments', appointmentRoutes);

app.listen(3001, () => {
    console.log("🔥 Backend corriendo en puerto 3001");
});