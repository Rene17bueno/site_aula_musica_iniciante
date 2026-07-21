exports.handler = async (event) => {
    try {
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 204,
                headers: corsHeaders(),
                body: ""
            };
        }

        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                headers: corsHeaders(),
                body: JSON.stringify({ ok: false, error: "Metodo nao permitido." })
            };
        }

        const webhookKey = process.env.WEBHOOK_KEY || "";
        const providedKey = event.headers["x-webhook-key"] || event.headers["X-Webhook-Key"] || "";
        if (webhookKey && providedKey !== webhookKey) {
            return {
                statusCode: 401,
                headers: corsHeaders(),
                body: JSON.stringify({ ok: false, error: "Webhook key invalida." })
            };
        }

        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
        const permanentToken = process.env.WHATSAPP_PERMANENT_TOKEN || "";

        if (!phoneNumberId || !permanentToken) {
            return {
                statusCode: 500,
                headers: corsHeaders(),
                body: JSON.stringify({
                    ok: false,
                    error: "Configure WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_PERMANENT_TOKEN nas variaveis do Netlify."
                })
            };
        }

        const payload = JSON.parse(event.body || "{}");
        const toDigits = String(payload.to || "").replace(/\D+/g, "");
        const message = String(payload.message || "").trim();

        if (!toDigits || toDigits.length < 10) {
            return {
                statusCode: 400,
                headers: corsHeaders(),
                body: JSON.stringify({ ok: false, error: "Telefone destino invalido." })
            };
        }

        if (!message) {
            return {
                statusCode: 400,
                headers: corsHeaders(),
                body: JSON.stringify({ ok: false, error: "Mensagem vazia." })
            };
        }

        const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${permanentToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: toDigits,
                type: "text",
                text: { body: message }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: corsHeaders(),
                body: JSON.stringify({
                    ok: false,
                    error: data?.error?.message || "Falha no envio via WhatsApp Cloud API.",
                    details: data
                })
            };
        }

        return {
            statusCode: 200,
            headers: corsHeaders(),
            body: JSON.stringify({ ok: true, result: data })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: corsHeaders(),
            body: JSON.stringify({ ok: false, error: error.message || "Erro interno." })
        };
    }
};

function corsHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, x-webhook-key",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
}
