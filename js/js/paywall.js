// ============================================================
// PAYWALL DE CAPÍTULOS PREMIUM
// Libera preview grátis do capítulo e trava o restante do
// conteúdo atrás de um CTA de compra (Mercado Pago).
//
// Como funciona:
// 1. Se já houver "acesso_premium=true" no localStorage, não trava nada.
// 2. Se a URL voltar do Mercado Pago com ?payment_id=...&status=approved,
//    confirma o pagamento na function /verify-payment antes de liberar.
// 3. Caso contrário, mostra só os primeiros blocos de conteúdo e
//    substitui o restante por um card de desbloqueio.
//
// CONFIGURAR: troque MP_PAYMENT_LINK pelo link de pagamento real
// gerado no painel do Mercado Pago (Cobrar > Link de pagamento).
// ============================================================

(function () {
    "use strict";

    const MP_PAYMENT_LINK = "https://mpago.la/2tCeYo9";
    const STORAGE_KEY = "acesso_premium";
    const FREE_BLOCKS = 6; // quantos elementos do início do capítulo ficam visíveis de graça

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        const main = document.querySelector("main.chapter-content[data-premium='true']");
        if (!main) return;

        if (localStorage.getItem(STORAGE_KEY) === "true") return; // já é premium, não trava

        const unlockedNow = await checkReturnFromPayment();
        if (unlockedNow) return; // pagamento acabou de ser confirmado, libera tudo

        applyGate(main);
    }

    async function checkReturnFromPayment() {
        const params = new URLSearchParams(window.location.search);
        const paymentId = params.get("payment_id") || params.get("collection_id");
        const status = params.get("status") || params.get("collection_status");

        if (!paymentId || status !== "approved") return false;

        try {
            const resp = await fetch(`/.netlify/functions/verify-payment?payment_id=${encodeURIComponent(paymentId)}`);
            const data = await resp.json();
            if (data && data.ok && data.approved) {
                localStorage.setItem(STORAGE_KEY, "true");
                return true;
            }
        } catch (err) {
            console.warn("Não foi possível confirmar o pagamento automaticamente.", err);
        }
        return false;
    }

    function applyGate(main) {
        const container = main.querySelector(".container");
        if (!container) return;

        const children = Array.from(container.children);
        if (children.length <= FREE_BLOCKS) return; // capítulo curto, não trava

        const hiddenNodes = children.slice(FREE_BLOCKS);
        hiddenNodes.forEach((node) => node.remove());

        const gate = document.createElement("div");
        gate.className = "premium-gate-card";
        gate.innerHTML = `
            <div class="premium-gate-inner">
                <i class="fas fa-lock"></i>
                <h3>Conteúdo completo deste capítulo é exclusivo para quem tem a Apostila</h3>
                <p>Você acabou de ler o preview grátis. O restante do capítulo, com todos os diagramas e exercícios, está disponível na apostila digital por <strong>R$ 27</strong>.</p>
                <a class="btn btn-premium-gate" href="${MP_PAYMENT_LINK}">
                    <i class="fas fa-unlock"></i> Desbloquear apostila completa — R$ 27
                </a>
                <p class="premium-gate-note">Pagamento único via Mercado Pago (cartão, Pix ou boleto). O acesso libera automaticamente após a confirmação.</p>
            </div>
        `;
        container.appendChild(gate);

        if (!document.getElementById("premium-gate-style")) {
            const style = document.createElement("style");
            style.id = "premium-gate-style";
            style.textContent = `
                .premium-gate-card { margin-top: 2rem; padding: 2.5rem 1.5rem; border-radius: 14px;
                    background: linear-gradient(180deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02));
                    border: 1px solid rgba(212,175,55,0.35); text-align: center; }
                .premium-gate-card i.fa-lock { font-size: 1.8rem; color: #c9a227; margin-bottom: .75rem; }
                .premium-gate-card h3 { font-size: 1.25rem; margin-bottom: .75rem; }
                .premium-gate-card p { max-width: 560px; margin: 0 auto .5rem; opacity: .85; }
                .btn-premium-gate { display: inline-block; margin-top: 1rem; padding: .8rem 1.8rem;
                    border-radius: 999px; background: #c9a227; color: #1a1a1a; font-weight: 600;
                    text-decoration: none; transition: transform .15s ease; }
                .btn-premium-gate:hover { transform: translateY(-2px); color: #1a1a1a; }
                .premium-gate-note { font-size: .8rem; margin-top: .9rem; opacity: .65; }
            `;
            document.head.appendChild(style);
        }
    }
})();
