const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId requerido" });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: false,
        premium_plan: null,
        premium_since: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error cancelando premium:", error);
      return res.status(500).json({ error: "Error al cancelar premium" });
    }

    res.json({ success: true, message: "Premium cancelado correctamente" });
  } catch (error) {
    console.error("Error en cancel-premium:", error);
    res.status(500).json({ error: "Error al cancelar premium" });
  }
};
