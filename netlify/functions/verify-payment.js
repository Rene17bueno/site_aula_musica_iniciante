// ============================================================
// VERIFICA PAGAMENTO NO MERCADO PAGO
// Chamada pelo paywall.js quando o comprador volta do checkout.
// Confirma no servidor (nunca no navegador) se o pagamento foi
// realmente aprovado antes de liberar o acesso premium.
//
// Configurar no Netlify (Site settings > Environment variables):
//   MP_ACCESS_TOKEN = Access Token de produção da sua conta Mercado Pago
//   (Painel Mercado Pago > Seu negócio > Configurações > Credenciais)
// ============================================================

exports.handler = async (event) => {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    try {
        const paymentId = event.queryStringParameters && event.queryStringParameters.payment_id;
        if (!paymentId) {
            return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "payment_id ausente." }) };
        }

        const accessToken = process.env.MP_ACCESS_TOKEN || "";
        if (!accessToken) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ ok: false, error: "Configure MP_ACCESS_TOKEN nas variáveis do Netlify." })
            };
        }

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ ok: false, error: data?.message || "Falha ao consultar pagamento." })
            };
        }

        const approved = data.status === "approved";

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                ok: true,
                approved,
                status: data.status,
                payer_email: data.payer ? data.payer.email : null
            })
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: error.message || "Erro interno." }) };
    }
};
