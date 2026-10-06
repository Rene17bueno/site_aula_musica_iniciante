// Página de aulas em vídeo: carrega aulas/aulas.json, controla player, progresso,
// bloqueio das Aulas 3 a 6 (mesma chave de acesso do paywall.js) e transcrição.
(function () {
    "use strict";
    var KEY_ACCESS = "acesso_premium", KEY_SEEN = "aulas_vistas";
    var $ = function (id) { return document.getElementById(id); };
    var data, cur = { a: 1, p: 1 }, seen = {};

    function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
    function save(k, v) { try { localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); } catch (e) {} }
    function unlocked() { try { return localStorage.getItem(KEY_ACCESS) === "true"; } catch (e) { return false; } }
    function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function aula(n) { return data.aulas[n - 1]; }
    function canWatch(a) { return aula(a).livre || unlocked(); }
    function total() { return data.aulas.reduce(function (n, a) { return n + a.partes.length; }, 0); }

    // Retorno do Mercado Pago (?payment_id=...&status=approved) -> confirma no servidor
    function checkReturn() {
        var q = new URLSearchParams(location.search), id = q.get("payment_id") || q.get("collection_id"), st = q.get("status") || q.get("collection_status");
        if (!id || st !== "approved") return Promise.resolve();
        return fetch("/api/verify-payment?payment_id=" + encodeURIComponent(id)).then(function (r) { return r.json(); })
            .then(function (d) { if (d && d.ok && d.approved) save(KEY_ACCESS, "true"); }).catch(function () {});
    }

    function renderTabs() {
        $("tabs").innerHTML = data.aulas.map(function (a) {
            var lock = !canWatch(a.n) ? ' <i class="fas fa-lock small"></i>' : "";
            return '<button class="aula-tab' + (a.n === cur.a ? " active" : "") + '" role="tab" aria-selected="' + (a.n === cur.a) + '" data-a="' + a.n + '"><strong>Aula ' + a.n + lock + '</strong><span>' + esc(a.titulo) + "</span></button>";
        }).join("");
    }
    function renderList() {
        var a = aula(cur.a);
        $("plist").innerHTML = a.partes.map(function (p) {
            var done = seen[p.id];
            return '<li><button class="part-item' + (p.n === cur.p ? " active" : "") + (done ? " done" : "") + '" data-p="' + p.n + '"><img src="aulas/poster/' + p.id + '.jpg" alt="" loading="lazy" width="40" height="71"><span class="t">' + p.n + ". " + esc(p.titulo) + "<small>" + fmt(p.dur) + '</small></span><span class="st">' + (done ? '<i class="fas fa-check-circle"></i>' : (canWatch(a.n) ? '<i class="fas fa-play"></i>' : '<i class="fas fa-lock"></i>')) + "</span></button></li>";
        }).join("");
    }
    function progress() {
        var n = Object.keys(seen).length, t = total();
        $("progBar").style.width = Math.round(100 * n / t) + "%";
        $("progTxt").textContent = n + " de " + t + " partes vistas";
    }
    function transcript(id) {
        var el = $("tr"); el.textContent = "";
        fetch("aulas/video/" + id + ".vtt").then(function (r) { return r.text(); }).then(function (txt) {
            if (cur.id !== id) return;
            var blocks = txt.replace(/\r/g, "").split("\n\n").slice(1), html = "";
            blocks.forEach(function (b) {
                var l = b.split("\n"), m = /(\d+):(\d+):(\d+)\.\d+ -->/.exec(l[1] || "");
                if (!m) return;
                html += '<button data-t="' + (+m[1] * 3600 + +m[2] * 60 + +m[3]) + '">' + esc(l.slice(2).join(" ")) + "</button>";
            });
            el.innerHTML = html;
        }).catch(function () {});
    }
    function play(a, p, autoplay) {
        cur.a = a; cur.p = p;
        var A = aula(a), P = A.partes[p - 1], v = $("vid"), ok = canWatch(a);
        cur.id = P.id;
        history.replaceState(null, "", "#" + P.id);
        $("box").classList.toggle("locked", !ok);
        $("kicker").textContent = "Aula " + a + " · " + A.titulo + " · parte " + p + " de " + A.partes.length;
        $("ptitle").textContent = P.titulo; $("pdesc").textContent = P.desc; $("nextBox").style.display = "none";
        document.title = P.titulo + " — Aula " + a + " | Estudo de Violão Iniciante";
        v.poster = "aulas/poster/" + P.id + ".jpg";
        if (ok) { v.src = "aulas/video/" + P.id + ".mp4"; $("trk").src = "aulas/video/" + P.id + ".vtt"; v.playbackRate = cur.rate || 1; if (autoplay) v.play().catch(function () {}); transcript(P.id); }
        else { v.removeAttribute("src"); v.load(); $("tr").textContent = ""; }
        renderTabs(); renderList();
    }
    function next() {
        var A = aula(cur.a);
        if (cur.p < A.partes.length) return [cur.a, cur.p + 1];
        return cur.a < data.aulas.length ? [cur.a + 1, 1] : null;
    }
    function jsonld() {
        var items = [];
        data.aulas.forEach(function (a) { a.partes.forEach(function (p) {
            items.push({ "@type": "VideoObject", name: "Aula " + a.n + "." + p.n + " — " + p.titulo, description: p.desc, thumbnailUrl: location.origin + "/aulas/poster/" + p.id + ".jpg", uploadDate: "2026-10-05", duration: "PT" + Math.floor(p.dur / 60) + "M" + (p.dur % 60) + "S", inLanguage: "pt-BR", isAccessibleForFree: a.livre });
        }); });
        $("ld").textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.map(function (v, i) { return { "@type": "ListItem", position: i + 1, item: v }; }) });
    }

    function start(d) {
        data = d; seen = load(KEY_SEEN, {});
        var m = /^#a(\d)p(\d)$/.exec(location.hash);
        if (m && aula(+m[1]) && aula(+m[1]).partes[+m[2] - 1]) { cur.a = +m[1]; cur.p = +m[2]; }
        else { // continua de onde parou: primeira parte não vista liberada
            outer: for (var i = 0; i < d.aulas.length; i++) { if (!canWatch(d.aulas[i].n)) break; for (var j = 0; j < d.aulas[i].partes.length; j++) if (!seen[d.aulas[i].partes[j].id]) { cur = { a: i + 1, p: j + 1 }; break outer; } }
        }
        jsonld(); progress(); play(cur.a, cur.p, false);

        $("tabs").addEventListener("click", function (e) { var b = e.target.closest("[data-a]"); if (b) play(+b.dataset.a, 1, false); });
        $("plist").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) play(cur.a, +b.dataset.p, true); });
        $("tr").addEventListener("click", function (e) { var b = e.target.closest("[data-t]"); if (b) { $("vid").currentTime = +b.dataset.t; $("vid").play().catch(function () {}); } });
        document.querySelector(".speed").addEventListener("click", function (e) {
            var b = e.target.closest("button"); if (!b) return;
            cur.rate = +b.dataset.s; $("vid").playbackRate = cur.rate;
            document.querySelectorAll(".speed button").forEach(function (x) { x.classList.toggle("on", x === b); });
        });
        $("nextBtn").addEventListener("click", function () { var n = next(); if (n) play(n[0], n[1], true); });
        document.querySelectorAll("[data-cta]").forEach(function (a) { a.addEventListener("click", function () { if (window.gtag) gtag("event", "click_apostila", { origem: "aulas_" + a.dataset.cta }); }); });
        var v = $("vid");
        v.addEventListener("ratechange", function () {});
        v.addEventListener("timeupdate", function () {
            var l = $("tr").children, t = v.currentTime, on = -1;
            for (var i = 0; i < l.length; i++) if (+l[i].dataset.t <= t) on = i;
            for (i = 0; i < l.length; i++) l[i].classList.toggle("on", i === on);
            if (v.duration && t / v.duration > 0.9 && !seen[cur.id]) { seen[cur.id] = 1; save(KEY_SEEN, seen); progress(); renderList(); if (window.gtag) gtag("event", "video_visto", { video: cur.id }); }
        });
        v.addEventListener("ended", function () {
            var n = next(); if (!n) return;
            if (!canWatch(n[0])) { play(n[0], 1, false); return; }
            $("nextBox").style.display = "block";
            setTimeout(function () { if (v.ended && $("nextBox").style.display === "block") { var x = next(); if (x) play(x[0], x[1], true); } }, 3500);
        });
    }
    checkReturn().then(function () { return fetch("aulas/aulas.json").then(function (r) { return r.json(); }); }).then(start)
        .catch(function () { $("ptitle").textContent = "Não foi possível carregar as aulas. Atualize a página."; });
})();
