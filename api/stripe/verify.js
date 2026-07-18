const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId requerido" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId && planId) {
        await supabase
          .from("profiles")
          .update({
            is_premium: true,
            premium_plan: planId,
            premium_since: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);
      }

      res.json({
        paid: true,
        planId: planId,
        amount: session.amount_total,
      });
    } else {
      res.json({ paid: false, status: session.payment_status });
    }
  } catch (error) {
    console.error("Error verifying session:", error);
    res.status(500).json({ error: "Error al verificar la sesión" });
  }
};
