require("dotenv").config();

const express = require("express");
const cors = require("cors");

const stripeRoutes = require("./routes/stripe");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de Stripe
app.use("/api/stripe", stripeRoutes);

// Verificar que el servidor funciona
app.get("/", (req, res) => {
    res.send("API de Stripe funcionando correctamente");
});

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});