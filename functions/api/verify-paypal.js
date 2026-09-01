// ============================================================
// PAYPAL - CRIA E CAPTURA PEDIDO (Cloudflare Pages Function)
// Checkout internacional em US$, chamado pelo paywall.js nas
// páginas /en/ e /es/.
//
// Rota: /api/verify-paypal (arquivo em functions/api/verify-paypal.js)
//   ?action=config              -> devolve { clientId, price }
//   ?action=create              -> cria pedido, devolve { id }
//   ?action=capture&order_id=.. -> captura e confirma no servidor
//
// Configurar no Cloudflare Pages (Settings > Environment variables):
//   PAYPAL_CLIENT_ID = Client ID (produção) da sua aplicação PayPal
//   PAYPAL_SECRET    = Secret (produção) da mesma aplicação
//   (opcional) PAYPAL_ENV = "sandbox" para testes; qualquer outro valor = produção
//   (opcional) PAYPAL_PRICE_USD = preço em dólar (padrão "9.00")
// ============================================================

const PRICE_USD_DEFAULT = "9.00";

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function json(obj, status = 200) {
    return new Response(JSON.stringify(obj), { status, headers: CORS_HEADERS });
}

function apiBase(env) {
    return (env.PAYPAL_ENV || "").toLowerCase() === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
}

async function getAccessToken(env) {
    const id = env.PAYPAL_CLIENT_ID || "";
    const secret = env.PAYPAL_SECRET || "";
    if (!id || !secret) return { error: "Configure PAYPAL_CLIENT_ID e PAYPAL_SECRET nas variáveis de ambiente." };

    const auth = btoa(`${id}:${secret}`);
    const resp = await fetch(`${apiBase(env)}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });
    const data = await resp.json();
    if (!resp.ok) return { error: data.error_description || "Falha na autenticação com o PayPal." };
    return { token: data.access_token };
}

export async function onRequestOptions() {
    return new Response("", { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const price = env.PAYPAL_PRICE_USD || PRICE_USD_DEFAULT;

    // Config pública consumida pelo paywall.js (client id não é segredo).
    if (action === "config") {
        const clientId = env.PAYPAL_CLIENT_ID || "";
        return json({
            ok: !!clientId,
            clientId: clientId,
            price: price,
            env: (env.PAYPAL_ENV || "").toLowerCase() === "sandbox" ? "sandbox" : "live"
        });
    }

    try {
        const t = await getAccessToken(env);
        if (t.error) return json({ ok: false, error: t.error }, 500);

        if (action === "create") {
            const resp = await fetch(`${apiBase(env)}/v2/checkout/orders`, {
                method: "POST",
                headers: { Authorization: `Bearer ${t.token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [{
                        description: "Beginner Guitar Study - digital workbook",
                        amount: { currency_code: "USD", value: price }
                    }],
                    application_context: {
                        brand_name: "Estudo de Violão Iniciante",
                        shipping_preference: "NO_SHIPPING",
                        user_action: "PAY_NOW"
                    }
                })
            });
            const data = await resp.json();
            if (!resp.ok) return json({ ok: false, error: data.message || "Falha ao criar o pedido." }, resp.status);
            return json({ ok: true, id: data.id });
        }

        if (action === "capture") {
            const orderId = url.searchParams.get("order_id");
            if (!orderId) return json({ ok: false, error: "order_id ausente." }, 400);

            const resp = await fetch(`${apiBase(env)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${t.token}`, "Content-Type": "application/json" }
            });
            const data = await resp.json();
            if (!resp.ok) return json({ ok: false, error: data.message || "Falha ao capturar o pagamento." }, resp.status);

            const cap = data.purchase_units &&
                data.purchase_units[0] &&
                data.purchase_units[0].payments &&
                data.purchase_units[0].payments.captures &&
                data.purchase_units[0].payments.captures[0];
            const paidValue = cap && cap.amount ? cap.amount.value : null;
            const approved = data.status === "COMPLETED"
                && cap && cap.status === "COMPLETED"
                && paidValue === price;

            return json({ ok: true, approved, status: data.status, paid: paidValue });
        }

        return json({ ok: false, error: "action inválida (use create ou capture)." }, 400);
    } catch (err) {
        return json({ ok: false, error: err.message || "Erro interno." }, 500);
    }
}
