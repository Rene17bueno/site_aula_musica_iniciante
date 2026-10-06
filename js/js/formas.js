// Formas tocaveis de acordes no violao (afinacao E A D G B E).
// Usado pelo exercicio "Construir acordes" e pela Enciclopedia de acordes (e pelo gerador de dados).
// findShapes(root, tones, opts): procura formas com ate 4 dedos (pestana conta como 1), dentro de 4 casas,
//   sem cordas abafadas no meio e com a tonica (ou opts.bass, nos acordes com baixo alterado) na nota mais grave.
//   tones = [{pc, s}] (pc = altura 0-11, s = semitons a partir da tonica). Cada forma: {v, cost, barre, base, top},
//   v = casas das cordas 6..1 (-1 abafada, 0 solta).
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.FormasAcorde = factory();
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";
    var STR_LOW = [4, 9, 2, 7, 11, 4];

    function findShapes(root, tones, opts) {
        var bass = opts && opts.bass != null ? opts.bass : root;
        var pcSet = {}; tones.forEach(function (t) { pcSet[t.pc] = true; });
        pcSet[bass] = true;
        var many = tones.length >= 4;
        function reqSet(level) {
            var r = {};
            tones.forEach(function (t) {
                var skip5 = many && t.s % 12 === 7;
                var skipExt = (level >= 1 && t.s >= 12) || (tones.length >= 6 && t.s >= 12 && t.s < 16);
                var onlyCore = level >= 2 && t.s % 12 !== 0 && [3, 4, 2, 5, 9, 10, 11].indexOf(t.s % 12) < 0;
                if (!skip5 && !skipExt && !onlyCore) r[t.pc] = true;
            });
            r[root] = true; r[bass] = true; return r;
        }
        var results = {};
        function evaluate(v, req, rootBass) {
            var sounding = [], i;
            for (i = 0; i < 6; i++) if (v[i] >= 0) sounding.push(i);
            if (sounding.length < 3) return;
            var lo = sounding[0], hi = sounding[sounding.length - 1];
            for (i = lo; i <= hi; i++) if (v[i] < 0) return;            // sem abafadas no meio
            if (rootBass && (STR_LOW[lo] + v[lo]) % 12 !== bass) return;
            var have = {}; sounding.forEach(function (k) { have[(STR_LOW[k] + v[k]) % 12] = true; });
            for (var pc in req) if (!have[pc]) return;
            var fretted = sounding.filter(function (k) { return v[k] > 0; });
            var m = fretted.length ? Math.min.apply(null, fretted.map(function (k) { return v[k]; })) : 0;
            var atM = fretted.filter(function (k) { return v[k] === m; });
            var barre = false;
            if (atM.length >= 2) {
                var a = Math.min.apply(null, atM), b = Math.max.apply(null, atM);
                barre = true;
                for (i = a; i <= b; i++) if (v[i] < m) barre = false;     // corda solta no meio impede a pestana
            }
            var fingers = barre ? 1 + fretted.filter(function (k) { return v[k] > m; }).length : fretted.length;
            if (fingers > 4) return;
            var opens = sounding.length - fretted.length;
            var mx = fretted.length ? Math.max.apply(null, fretted.map(function (k) { return v[k]; })) : 0;
            var cost = fingers + 0.35 * m + 0.6 * (mx - m) + 2 * (6 - sounding.length) - 0.4 * opens + (barre ? 1.5 : 0) + (rootBass ? 0 : 3);
            var key = v.join(",");
            if (!results[key]) results[key] = { v: v.slice(), cost: cost, barre: barre, base: m, top: mx };
        }
        function run(req, rootBass) {
            for (var lo = 1; lo <= 12; lo++) {
                var hi = lo + 3, v = [-1, -1, -1, -1, -1, -1];
                (function rec(idx) {
                    if (idx === 6) { evaluate(v, req, rootBass); return; }
                    v[idx] = -1; rec(idx + 1);
                    if (lo <= 2 && pcSet[STR_LOW[idx] % 12]) { v[idx] = 0; rec(idx + 1); }
                    for (var f = lo; f <= hi; f++) {
                        if (pcSet[(STR_LOW[idx] + f) % 12]) { v[idx] = f; rec(idx + 1); }
                    }
                    v[idx] = -1;
                })(0);
            }
        }
        for (var level = 0; level <= 2 && !Object.keys(results).length; level++) {
            run(reqSet(level), true);
            if (!Object.keys(results).length) run(reqSet(level), false);
        }
        return Object.keys(results).map(function (k) { return results[k]; })
            .sort(function (a, b) { return a.cost - b.cost || a.base - b.base; });
    }

    // Escolhe formas espalhadas pelo braco todo: a melhor de cada faixa de casas (aberta, 1-2, 3-4, ...),
    // ordenadas da mais perto da pestana para a mais aguda.
    function spread(all, max) {
        var bestByBucket = {};
        all.forEach(function (sh) {
            var b = sh.base === 0 ? 0 : Math.floor((sh.base + 1) / 2);   // faixas de 2 casas
            if (!bestByBucket[b] || sh.cost < bestByBucket[b].cost) bestByBucket[b] = sh;
        });
        return Object.keys(bestByBucket).map(Number).sort(function (a, b) { return a - b; })
            .map(function (b) { return bestByBucket[b]; })
            .sort(function (a, b) { return a.base - b.base; }).slice(0, max || 8);
    }

    // Numeracao dos dedos (1-4) de uma forma: pestana = dedo 1; os demais da casa mais baixa para a mais alta
    // (na mesma casa, a corda mais grave primeiro). Retorna {corda(1-6): dedo}.
    function dedos(sh) {
        var v = sh.v, res = {}, n = 1, list = [];
        for (var k = 0; k < 6; k++) if (v[k] > 0) list.push(k);
        if (sh.barre) {
            list.forEach(function (k) { if (v[k] === sh.base) res[6 - k] = 1; });
            n = 2;
            list = list.filter(function (k) { return v[k] > sh.base; });
        }
        list.sort(function (a, b) { return v[a] - v[b] || a - b; });
        list.forEach(function (k) { res[6 - k] = Math.min(n++, 4); });
        return res;
    }

    return { STR_LOW: STR_LOW, findShapes: findShapes, spread: spread, dedos: dedos };
});
