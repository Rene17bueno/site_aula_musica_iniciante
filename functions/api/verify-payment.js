// ============================================================
// VERIFICA PAGAMENTO NO MERCADO PAGO (Cloudflare Pages Function)
// Chamada pelo paywall.js quando o comprador volta do checkout.
// Confirma no servidor (nunca no navegador) se o pagamento foi
// realmente aprovado antes de liberar o acesso premium.
//
// Rota: /api/verify-payment (arquivo em functions/api/verify-payment.js)
//
// Configurar no Cloudflare Pages (Settings > Environment variables):
//   MP_ACCESS_TOKEN = Access Token de produção da sua conta Mercado Pago
//   (Painel Mercado Pago > Seu negócio > Configurações > Credenciais)
// ============================================================

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(obj, status = 200) {
    return new Response(JSON.stringify(obj), { status, headers: CORS_HEADERS });
}

export async function onRequestOptions() {
    return new Response("", { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
    try {
        const url = new URL(context.request.url);
        const paymentId = url.searchParams.get("payment_id");
        if (!paymentId) {
            return json({ ok: false, error: "payment_id ausente." }, 400);
        }

        const accessToken = context.env.MP_ACCESS_TOKEN || "";
        if (!accessToken) {
            return json({ ok: false, error: "Configure MP_ACCESS_TOKEN nas variáveis de ambiente." }, 500);
        }

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();

        if (!response.ok) {
            return json({ ok: false, error: (data && data.message) || "Falha ao consultar pagamento." }, response.status);
        }

        const approved = data.status === "approved";
        return json({
            ok: true,
            approved,
            status: data.status,
            payer_email: data.payer ? data.payer.email : null
        });
    } catch (error) {
        return json({ ok: false, error: error.message || "Erro interno." }, 500);
    }
}
