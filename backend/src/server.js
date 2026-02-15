const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const appointmentRoutes = require('./routes/appointments.js');

app.use('/appointments', appointmentRoutes);

app.listen(3001, () => {
console.log("🔥 Backend corriendo en puerto 3001");
});
