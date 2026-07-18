require("dotenv").config();

const express = require("express");
const cors = require("cors");

const stripeRoutes = require("./routes/stripe");
const webhookRoutes = require("./routes/webhook");

const app = express();

// CORS — permitir cliente
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Webhook stripe — DEBE ir ANTES de express.json()
app.use("/api/stripe", webhookRoutes);

// JSON parser para el resto
app.use(express.json());

// Rutas de Stripe
app.use("/api/stripe", stripeRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("API de PoliTinder funcionando correctamente");
});

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});
