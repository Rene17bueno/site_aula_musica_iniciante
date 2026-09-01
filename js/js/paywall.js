// ============================================================
// PAYWALL DE CAPÍTULOS PREMIUM  /  PREMIUM CHAPTER PAYWALL
//
// - Libera preview grátis do capítulo e trava o restante.
// - Idioma detectado pela URL (/en/ ou /es/).
// - Pagamento:
//     PT  -> Mercado Pago (link em R$), botão <a> já no HTML / no card do gate.
//     EN/ES -> PayPal em US$ (SDK + Netlify Function /verify-paypal).
// - O desbloqueio é compartilhado entre os idiomas (mesma chave no localStorage).
// ============================================================

(function () {
    "use strict";

    var MP_PAYMENT_LINK = "https://mpago.la/2tCeYo9";
    var STORAGE_KEY = "acesso_premium";
    var FREE_BLOCKS = 6;

    var path = window.location.pathname;
    var LANG = "pt";
    if (/\/en(\/|$)/.test(path)) LANG = "en";
    else if (/\/es(\/|$)/.test(path)) LANG = "es";
    var USES_PAYPAL = (LANG === "en" || LANG === "es");

    var STR = {
        pt: {
            heading: "O conteúdo completo deste capítulo é exclusivo para quem tem a Apostila",
            body: 'Você acabou de ler o preview grátis. O restante do capítulo, com todos os diagramas e exercícios, está na apostila digital.',
            price: "R$ 27 · pagamento único",
            button: "Desbloquear apostila completa",
            note: "Pagamento via Mercado Pago (cartão, Pix ou boleto). O acesso libera automaticamente após a confirmação.",
            loading: "Carregando pagamento seguro…",
            unavailable: "Pagamento internacional em configuração. Volte em instantes.",
            failed: "Não foi possível confirmar o pagamento. Se o valor foi cobrado, fale com o suporte."
        },
        en: {
            heading: "The full content of this chapter is exclusive to those who own the Workbook",
            body: "You have just read the free preview. The rest of the chapter, with every diagram and exercise, is in the digital workbook.",
            price: "US$ 9 · one-time payment",
            button: "Unlock the full workbook",
            note: "Secure payment via PayPal (card or PayPal balance). Access is released automatically once the payment is confirmed.",
            loading: "Loading secure checkout…",
            unavailable: "International checkout is being set up. Please check back soon.",
            failed: "We could not confirm the payment. If you were charged, please contact support."
        },
        es: {
            heading: "El contenido completo de este capítulo es exclusivo para quienes tienen el Cuadernillo",
            body: "Acabas de leer la vista previa gratuita. El resto del capítulo, con todos los diagramas y ejercicios, está en el cuadernillo digital.",
            price: "US$ 9 · pago único",
            button: "Desbloquear el cuadernillo completo",
            note: "Pago seguro con PayPal (tarjeta o saldo PayPal). El acceso se libera automáticamente tras la confirmación.",
            loading: "Cargando el pago seguro…",
            unavailable: "El pago internacional se está configurando. Vuelve en unos instantes.",
            failed: "No pudimos confirmar el pago. Si se te cobró, contacta con soporte."
        }
    };
    var s = STR[LANG];

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        // Botão de compra na home (EN/ES): <div id="paypal-buy"></div>
        var buyBox = document.getElementById("paypal-buy");
        if (buyBox && USES_PAYPAL) renderPayPal(buyBox, function () { window.location.reload(); });

        var main = document.querySelector("main.chapter-content[data-premium='true']");
        if (!main) return;
        if (localStorage.getItem(STORAGE_KEY) === "true") return;

        var unlockedNow = await checkReturnFromPayment();
        if (unlockedNow) return;

        applyGate(main);
    }

    // Retorno do Mercado Pago (?payment_id=...&status=approved) -> confirma no servidor
    async function checkReturnFromPayment() {
        var params = new URLSearchParams(window.location.search);
        var paymentId = params.get("payment_id") || params.get("collection_id");
        var status = params.get("status") || params.get("collection_status");
        if (!paymentId || status !== "approved") return false;
        try {
            var resp = await fetch("/api/verify-payment?payment_id=" + encodeURIComponent(paymentId));
            var data = await resp.json();
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
        var container = main.querySelector(".container");
        if (!container) return;

        var children = Array.prototype.slice.call(container.children);
        if (children.length <= FREE_BLOCKS) return;
        children.slice(FREE_BLOCKS).forEach(function (node) { node.remove(); });

        injectStyle();

        var gate = document.createElement("div");
        gate.className = "premium-gate-card";
        var inner =
            '<div class="premium-gate-inner">' +
            '<i class="fas fa-lock"></i>' +
            '<h3>' + s.heading + '</h3>' +
            '<p>' + s.body + '</p>' +
            '<p class="premium-gate-price">' + s.price + '</p>';

        if (USES_PAYPAL) {
            inner += '<div id="paypal-gate-btns" class="paypal-btns"></div>' +
                     '<p class="premium-gate-status">' + s.loading + '</p>';
        } else {
            inner += '<a class="btn btn-premium-gate" href="' + MP_PAYMENT_LINK + '">' +
                     '<i class="fas fa-unlock"></i> ' + s.button + '</a>';
        }
        inner += '<p class="premium-gate-note">' + s.note + '</p></div>';
        gate.innerHTML = inner;
        container.appendChild(gate);

        if (USES_PAYPAL) {
            var box = gate.querySelector("#paypal-gate-btns");
            var statusEl = gate.querySelector(".premium-gate-status");
            renderPayPal(box, function () { window.location.reload(); }, statusEl);
        }
    }

    // ---- PayPal (EN/ES) -----------------------------------
    var _paypalSdk = null; // promise

    function loadSdk(clientId) {
        if (_paypalSdk) return _paypalSdk;
        _paypalSdk = new Promise(function (resolve, reject) {
            var sc = document.createElement("script");
            sc.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(clientId) +
                     "&currency=USD&intent=capture&disable-funding=paylater";
            sc.onload = function () { resolve(window.paypal); };
            sc.onerror = function () { reject(new Error("PayPal SDK failed to load")); };
            document.head.appendChild(sc);
        });
        return _paypalSdk;
    }

    function renderPayPal(targetEl, onSuccess, statusEl) {
        function setStatus(msg) { if (statusEl) statusEl.textContent = msg || ""; }
        fetch("/api/verify-paypal?action=config")
            .then(function (r) { return r.json(); })
            .then(function (cfg) {
                if (!cfg || !cfg.ok || !cfg.clientId) { setStatus(s.unavailable); return; }
                return loadSdk(cfg.clientId).then(function (paypal) {
                    setStatus("");
                    paypal.Buttons({
                        style: { shape: "pill", color: "gold", layout: "vertical", label: "pay" },
                        createOrder: function () {
                            return fetch("/api/verify-paypal?action=create")
                                .then(function (r) { return r.json(); })
                                .then(function (d) {
                                    if (!d.ok || !d.id) throw new Error(d.error || "create failed");
                                    return d.id;
                                });
                        },
                        onApprove: function (data) {
                            setStatus(s.loading);
                            return fetch("/api/verify-paypal?action=capture&order_id=" + encodeURIComponent(data.orderID))
                                .then(function (r) { return r.json(); })
                                .then(function (d) {
                                    if (d.ok && d.approved) {
                                        localStorage.setItem(STORAGE_KEY, "true");
                                        onSuccess();
                                    } else {
                                        setStatus(s.failed);
                                    }
                                });
                        },
                        onError: function (err) {
                            console.warn("PayPal error", err);
                            setStatus(s.failed);
                        }
                    }).render(targetEl);
                });
            })
            .catch(function (err) {
                console.warn(err);
                setStatus(s.unavailable);
            });
    }

    function injectStyle() {
        if (document.getElementById("premium-gate-style")) return;
        var style = document.createElement("style");
        style.id = "premium-gate-style";
        style.textContent =
            ".premium-gate-card { margin-top: 2rem; padding: 2.5rem 1.5rem; border-radius: 14px;" +
            "background: linear-gradient(180deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02));" +
            "border: 1px solid rgba(212,175,55,0.35); text-align: center; }" +
            ".premium-gate-card i.fa-lock { font-size: 1.8rem; color: #c9a227; margin-bottom: .75rem; }" +
            ".premium-gate-card h3 { font-size: 1.25rem; margin-bottom: .75rem; }" +
            ".premium-gate-card p { max-width: 560px; margin: 0 auto .5rem; opacity: .85; }" +
            ".premium-gate-price { font-weight: 700; color: #c9a227; opacity: 1 !important; margin-top: .5rem; }" +
            ".paypal-btns { max-width: 320px; margin: 1rem auto .25rem; }" +
            ".premium-gate-status { font-size: .85rem; opacity: .7; min-height: 1em; }" +
            ".btn-premium-gate { display: inline-block; margin-top: 1rem; padding: .8rem 1.8rem;" +
            "border-radius: 999px; background: #c9a227; color: #1a1a1a; font-weight: 600;" +
            "text-decoration: none; transition: transform .15s ease; }" +
            ".btn-premium-gate:hover { transform: translateY(-2px); color: #1a1a1a; }" +
            ".premium-gate-note { font-size: .8rem; margin-top: .9rem; opacity: .65; }";
        document.head.appendChild(style);
    }
})();
