const express = require("express");
const stripe = require("../config/stripe");

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "PoliTinder Premium",
                        },
                        unit_amount: 500,
                    },
                    quantity: 1,
                },
            ],
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "No fue posible crear la sesión de pago."
        });
    }
});

module.exports = router;