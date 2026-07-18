const express = require("express");
const stripe = require("../config/stripe");
const { supabaseAdmin } = require("../config/supabase");

const router = express.Router();

// Webhook de Stripe — recibe eventos de pago
// IMPORTANTE: Este endpoint debe usar raw body, no JSON parseado
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET no está configurado");
      return res.status(500).json({ error: "Webhook no configurado" });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: "Signature inválida" });
    }

    // Manejar evento de pago exitoso
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (userId && planId) {
        try {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              is_premium: true,
              premium_plan: planId,
              premium_since: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (error) {
            console.error("Error updating premium status:", error);
          } else {
            console.log(`Premium activado para usuario ${userId}, plan: ${planId}`);
          }
        } catch (err) {
          console.error("Error en webhook handler:", err);
        }
      }
    }

    // Siempre responder 200 a Stripe para confirmar recepción
    res.json({ received: true });
  }
);

module.exports = router;
