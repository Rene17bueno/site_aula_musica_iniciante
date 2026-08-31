// ============================================================
// PAYPAL - CRIA E CAPTURA PEDIDO (checkout internacional em US$)
// Chamada pelo paywall.js nas paginas /en/ e /es/.
//
// Fluxo:
//   GET  /verify-paypal?action=create              -> cria pedido de US$ PRICE, devolve { id }
//   GET  /verify-paypal?action=capture&order_id=.. -> captura e confirma no servidor
//                                                     devolve { ok, approved }
//
// Configurar no Netlify (Site configuration > Environment variables):
//   PAYPAL_CLIENT_ID = Client ID (produção) da sua aplicação PayPal
//   PAYPAL_SECRET    = Secret (produção) da mesma aplicação
//   (opcional) PAYPAL_ENV = "sandbox" para testes; qualquer outro valor = produção
//   (opcional) PAYPAL_PRICE_USD = preço em dólar (padrão "9.00")
// ============================================================

const PRICE_USD_DEFAULT = "9.00";

function apiBase() {
    return (process.env.PAYPAL_ENV || "").toLowerCase() === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
}

async function getAccessToken() {
    const id = process.env.PAYPAL_CLIENT_ID || "";
    const secret = process.env.PAYPAL_SECRET || "";
    if (!id || !secret) return { error: "Configure PAYPAL_CLIENT_ID e PAYPAL_SECRET nas variáveis do Netlify." };

    const auth = Buffer.from(`${id}:${secret}`).toString("base64");
    const resp = await fetch(`${apiBase()}/v1/oauth2/token`, {
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

exports.handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
    };
    if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

    const price = process.env.PAYPAL_PRICE_USD || PRICE_USD_DEFAULT;
    const q = event.queryStringParameters || {};
    const action = q.action;

    // Config pública consumida pelo paywall.js (client id não é segredo).
    if (action === "config") {
        const clientId = process.env.PAYPAL_CLIENT_ID || "";
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ok: !!clientId,
                clientId: clientId,
                price: price,
                env: (process.env.PAYPAL_ENV || "").toLowerCase() === "sandbox" ? "sandbox" : "live"
            })
        };
    }

    try {
        const t = await getAccessToken();
        if (t.error) return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: t.error }) };

        if (action === "create") {
            const resp = await fetch(`${apiBase()}/v2/checkout/orders`, {
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
            if (!resp.ok) return { statusCode: resp.status, headers, body: JSON.stringify({ ok: false, error: data.message || "Falha ao criar o pedido." }) };
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: data.id }) };
        }

        if (action === "capture") {
            const orderId = q.order_id;
            if (!orderId) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "order_id ausente." }) };

            const resp = await fetch(`${apiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
                method: "POST",
                headers: { Authorization: `Bearer ${t.token}`, "Content-Type": "application/json" }
            });
            const data = await resp.json();
            if (!resp.ok) return { statusCode: resp.status, headers, body: JSON.stringify({ ok: false, error: data.message || "Falha ao capturar o pagamento." }) };

            const cap = data.purchase_units
                && data.purchase_units[0]
                && data.purchase_units[0].payments
                && data.purchase_units[0].payments.captures
                && data.purchase_units[0].payments.captures[0];
            const paidValue = cap && cap.amount ? cap.amount.value : null;
            const approved = data.status === "COMPLETED"
                && cap && cap.status === "COMPLETED"
                && paidValue === price;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true, approved, status: data.status, paid: paidValue })
            };
        }

        return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "action inválida (use create ou capture)." }) };
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err.message || "Erro interno." }) };
    }
};
