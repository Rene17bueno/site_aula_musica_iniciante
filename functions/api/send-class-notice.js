// ============================================================
// ENVIA AVISO DE AULA VIA WHATSAPP (Cloudflare Pages Function)
// Usado pelo painel admin da comunidade (js/js/community/admin-main.js).
//
// Rota: /api/send-class-notice (arquivo em functions/api/send-class-notice.js)
//
// Configurar no Cloudflare Pages (Settings > Environment variables):
//   WHATSAPP_PHONE_NUMBER_ID = ID do número no WhatsApp Cloud API
//   WHATSAPP_PERMANENT_TOKEN = token permanente do WhatsApp Cloud API
//   (opcional) WEBHOOK_KEY = chave extra exigida no header x-webhook-key
// ============================================================

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-webhook-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(obj, status = 200) {
    return new Response(JSON.stringify(obj), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
    return new Response("", { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;

        const webhookKey = env.WEBHOOK_KEY || "";
        const providedKey = request.headers.get("x-webhook-key") || "";
        if (webhookKey && providedKey !== webhookKey) {
            return json({ ok: false, error: "Webhook key inválida." }, 401);
        }

        const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID || "";
        const permanentToken = env.WHATSAPP_PERMANENT_TOKEN || "";
        if (!phoneNumberId || !permanentToken) {
            return json({ ok: false, error: "Configure WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_PERMANENT_TOKEN nas variáveis de ambiente." }, 500);
        }

        const payload = await request.json().catch(() => ({}));
        const toDigits = String(payload.to || "").replace(/\D+/g, "");
        const message = String(payload.message || "").trim();

        if (!toDigits || toDigits.length < 10) {
            return json({ ok: false, error: "Telefone destino inválido." }, 400);
        }
        if (!message) {
            return json({ ok: false, error: "Mensagem vazia." }, 400);
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
            return json({
                ok: false,
                error: (data && data.error && data.error.message) || "Falha no envio via WhatsApp Cloud API.",
                details: data
            }, response.status);
        }

        return json({ ok: true, result: data });
    } catch (error) {
        return json({ ok: false, error: error.message || "Erro interno." }, 500);
    }
}
