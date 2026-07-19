const express = require("express");
const stripe = require("../config/stripe");
const { supabaseAdmin } = require("../config/supabase");

const router = express.Router();

const PLAN_PRICES = {
  premium: 500,
  premium_plus: 1000,
};

const PLAN_NAMES = {
  premium: "PoliTinder Premium",
  premium_plus: "PoliTinder Premium+",
};

// Crear sesión de checkout
router.post("/checkout", async (req, res) => {
    try {
        const { userId, planId } = req.body;

        const amount = PLAN_PRICES[planId];
        const productName = PLAN_NAMES[planId];

        if (!amount || !productName) {
            return res.status(400).json({
                error: "Plan no válido."
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            metadata: {
                userId: userId || "",
                planId: planId,
            },
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: productName,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/cancel`,
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error("Stripe checkout error:", error);

        res.status(500).json({
            error: "No fue posible crear la sesión de pago."
        });
    }
});

// Verificar estado de una sesión de checkout
router.get("/verify", async (req, res) => {
    try {
        const sessionId = req.query.sessionId;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            const userId = session.metadata?.userId;
            const planId = session.metadata?.planId;

            // Actualizar Supabase si el webhook aún no lo hizo
            if (userId && planId) {
                await supabaseAdmin
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
});

// Cancelar suscripción premium
router.post("/cancel", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId requerido" });
        }

        const { error } = await supabaseAdmin
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
        console.error("Error en cancel:", error);
        res.status(500).json({ error: "Error al cancelar premium" });
    }
});

module.exports = router;
