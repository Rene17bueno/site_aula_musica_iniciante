import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

const {
    PORT = 3000,
    WEBHOOK_KEY = "",
    ALLOWED_ORIGIN = "*",
    WHATSAPP_PHONE_NUMBER_ID = "",
    WHATSAPP_PERMANENT_TOKEN = ""
} = process.env;

app.use(express.json({ limit: "256kb" }));
app.use(
    cors({
        origin: ALLOWED_ORIGIN === "*" ? true : ALLOWED_ORIGIN,
        methods: ["POST", "GET", "OPTIONS"],
        allowedHeaders: ["Content-Type", "x-webhook-key"]
    })
);

app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "whatsapp-class-notice-webhook" });
});

app.post("/send-class-notice", async (req, res) => {
    try {
        if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_PERMANENT_TOKEN) {
            return res.status(500).json({
                ok: false,
                error: "Webhook sem configuracao da WhatsApp Cloud API."
            });
        }

        if (WEBHOOK_KEY) {
            const providedKey = req.header("x-webhook-key") || "";
            if (providedKey !== WEBHOOK_KEY) {
                return res.status(401).json({ ok: false, error: "Webhook key invalida." });
            }
        }

        const { to, message } = req.body || {};
        const toDigits = String(to || "").replace(/\D+/g, "");
        const text = String(message || "").trim();

        if (!toDigits || toDigits.length < 10) {
            return res.status(400).json({ ok: false, error: "Telefone de destino invalido." });
        }

        if (!text) {
            return res.status(400).json({ ok: false, error: "Mensagem vazia." });
        }

        const endpoint = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_PERMANENT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: toDigits,
                type: "text",
                text: {
                    body: text
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                ok: false,
                error: data?.error?.message || "Falha ao enviar mensagem no WhatsApp.",
                details: data
            });
        }

        return res.json({ ok: true, provider: "whatsapp-cloud-api", result: data });
    } catch (error) {
        return res.status(500).json({ ok: false, error: error.message || "Erro interno." });
    }
});

app.listen(PORT, () => {
    console.log(`Webhook WhatsApp ativo na porta ${PORT}`);
});
