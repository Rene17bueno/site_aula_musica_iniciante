// Enciclopedia de acordes: lista os acordes de data/enciclopedia.json com as formas em todo o braco.
(function () {
    "use strict";
    var $ = function (id) { return document.getElementById(id); };
    var data = null, grupo = "todos";
    var GRUPOS = { "maior-menor": "Maior e menor", variacao: "Variação / extensão", slash: "Baixo alterado" };

    function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

    // Diagrama vertical: cordas 6..1 da esquerda para a direita, casas de cima para baixo
    function diagrama(sh, c) {
        var v = sh.v, SX = 17, SY = 24, X0 = 40, Y0 = 34;
        var frets = v.filter(function (f) { return f > 0; });
        var hasOpen = v.some(function (f) { return f === 0; });
        var near = hasOpen || sh.base <= 2;
        var f0 = near ? 1 : sh.base, rows = Math.max(4, sh.top - f0 + 1);
        var W = X0 + 5 * SX + 18, H = Y0 + rows * SY + 20;
        var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(c.cifra) + " forma " + v.map(function (f) { return f < 0 ? "x" : f; }).join(" ") + '">';
        for (var r = 0; r <= rows; r++) s += '<line x1="' + X0 + '" x2="' + (X0 + 5 * SX) + '" y1="' + (Y0 + r * SY) + '" y2="' + (Y0 + r * SY) + '" class="g"/>';
        if (near) s += '<rect x="' + (X0 - 1) + '" y="' + (Y0 - 3) + '" width="' + (5 * SX + 2) + '" height="4" class="nut"/>';
        for (var k = 0; k < 6; k++) s += '<line x1="' + (X0 + k * SX) + '" x2="' + (X0 + k * SX) + '" y1="' + Y0 + '" y2="' + (Y0 + rows * SY) + '" class="g"/>';
        if (!near) s += '<text x="' + (X0 - 14) + '" y="' + (Y0 + SY / 2 + 4) + '" class="fn" text-anchor="end">' + f0 + 'ª</text>';
        for (k = 0; k < 6; k++) {
            var x = X0 + k * SX, f = v[k];
            if (f < 0) s += '<text x="' + x + '" y="' + (Y0 - 10) + '" class="mu" text-anchor="middle">×</text>';
            else if (f === 0) s += '<circle cx="' + x + '" cy="' + (Y0 - 12) + '" r="5" class="op"/>';
        }
        if (sh.barre) {
            var ks = []; v.forEach(function (f, i) { if (f === sh.base) ks.push(i); });
            s += '<rect x="' + (X0 + Math.min.apply(null, ks) * SX - 7) + '" y="' + (Y0 + (sh.base - f0) * SY + 4) + '" width="' + ((Math.max.apply(null, ks) - Math.min.apply(null, ks)) * SX + 14) + '" height="' + (SY - 8) + '" rx="8" class="bar"/>';
        }
        var L = [4, 9, 2, 7, 11, 4];
        for (k = 0; k < 6; k++) {
            f = v[k]; if (f <= 0) continue;
            var pc = (L[k] + f) % 12, cls = pc === c.rootPc ? "dr" : (c.bassPc != null && pc === c.bassPc ? "db" : "dn");
            var cx = X0 + k * SX, cy = Y0 + (f - f0) * SY + SY / 2;
            s += '<circle cx="' + cx + '" cy="' + cy + '" r="8" class="' + cls + '"/><text x="' + cx + '" y="' + (cy + 3.5) + '" class="dt" text-anchor="middle">' + (sh.dedos[6 - k] || "") + "</text>";
        }
        return s + "</svg>";
    }

    function legenda(sh) {
        var cifra = sh.v.map(function (f) { return f < 0 ? "x" : f; });
        var txt = cifra.some(function (x) { return String(x).length > 1; }) ? cifra.join("-") : cifra.join("");
        var pos = sh.v.indexOf(0) >= 0 ? "aberta" : sh.base + "ª casa";
        return "<b>" + txt + "</b><span>" + pos + (sh.barre ? " · pestana" : "") + "</span>";
    }

    function card(c) {
        var shapes = c.formas.map(function (sh) {
            return '<figure class="enc-shape">' + diagrama(sh, c) + "<figcaption>" + legenda(sh) + "</figcaption></figure>";
        }).join("");
        var chips = c.notas.map(function (n, i) { return '<span class="enc-chip' + (i === 0 ? " root" : "") + '">' + esc(n) + "<small>" + esc(c.formula[i]) + "</small></span>"; }).join("");
        var baixo = c.baixo ? '<span class="enc-bass">Baixo em ' + esc(c.baixo) + "</span>" : "";
        return '<article class="enc-card" id="' + c.id + '" data-grupo="' + c.grupo + '" data-root="' + c.rootPc + '">' +
            '<header><h3>' + esc(c.cifra) + "</h3><div><strong>" + esc(c.nome) + '</strong><span class="enc-tipo">' + esc(c.tipo) + "</span></div></header>" +
            (c.descricao ? "<p class=\"enc-desc\">" + esc(c.descricao) + "</p>" : "") +
            '<div class="enc-notes">' + chips + baixo + "</div>" +
            '<div class="enc-shapes" tabindex="0" aria-label="Formas de ' + esc(c.cifra) + ' no braço">' + shapes + "</div>" +
            '<p class="enc-hint">' + c.formas.length + " formas, da " + (c.formas[0].v.indexOf(0) >= 0 ? "posição aberta" : c.formas[0].base + "ª casa") + " até a " + c.formas[c.formas.length - 1].top + "ª. O número em cada bolinha é o dedo.</p></article>";
    }

    function tabelaNotas() {
        $("notasBody").innerHTML = data.notas.map(function (n) {
            return "<tr><td><b>" + esc(n.cifra) + "</b></td><td>" + esc(n.nota) + "</td><td>" + esc(n.sustenido) + "</td><td>" + esc(n.bemol) + "</td><td class=\"text-muted\">" + esc(n.explicacao) + "</td></tr>";
        }).join("");
    }

    function render() {
        var q = $("busca").value.trim().toLowerCase(), tom = $("tom").value;
        var list = data.acordes.filter(function (c) {
            if (grupo !== "todos" && c.grupo !== grupo) return false;
            if (tom !== "" && String(c.rootPc) !== tom) return false;
            return !q || c.cifra.toLowerCase().indexOf(q) >= 0 || c.nome.toLowerCase().indexOf(q) >= 0 || c.tipo.toLowerCase().indexOf(q) >= 0;
        });
        $("contagem").textContent = list.length + " de " + data.acordes.length + " acordes";
        $("lista").innerHTML = list.length ? list.map(card).join("") : '<p class="text-center text-muted py-5">Nenhum acorde encontrado.</p>';
    }

    function init() {
        var tons = ["Dó", "Dó♯ / Ré♭", "Ré", "Ré♯ / Mi♭", "Mi", "Fá", "Fá♯ / Sol♭", "Sol", "Sol♯ / Lá♭", "Lá", "Lá♯ / Si♭", "Si"];
        $("tom").innerHTML = '<option value="">Todos os tons</option>' + tons.map(function (t, i) { return '<option value="' + i + '">' + t + "</option>"; }).join("");
        document.querySelectorAll(".enc-filter").forEach(function (b) {
            b.addEventListener("click", function () {
                document.querySelectorAll(".enc-filter").forEach(function (x) { x.classList.remove("active"); });
                b.classList.add("active"); grupo = b.dataset.grupo; render();
            });
        });
        $("busca").addEventListener("input", render);
        $("tom").addEventListener("change", render);
        fetch("data/enciclopedia.json").then(function (r) { return r.json(); }).then(function (d) {
            data = d; tabelaNotas(); render();
            if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
        }).catch(function () { $("lista").innerHTML = '<p class="text-center text-muted py-5">Não foi possível carregar a enciclopédia.</p>'; });
    }
    document.addEventListener("DOMContentLoaded", init);
})();
