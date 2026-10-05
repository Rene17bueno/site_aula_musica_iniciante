// Exercicios "Construir acordes" e "Construir escalas".
// O aluno marca as 12 teclas cromaticas; a resposta e conferida por altura (enarmonia
// nao importa). Todas as definicoes vem de formulas: 12 tons x todos os tipos.
(function () {
    "use strict";

    var PT = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
    var CIF = ["C", "D", "E", "F", "G", "A", "B"];
    var NAT = [0, 2, 4, 5, 7, 9, 11];
    var KEY_LABELS = [["Dó", ""], ["Dó♯", "Ré♭"], ["Ré", ""], ["Ré♯", "Mi♭"], ["Mi", ""], ["Fá", ""],
        ["Fá♯", "Sol♭"], ["Sol", ""], ["Sol♯", "Lá♭"], ["Lá", ""], ["Lá♯", "Si♭"], ["Si", ""]];
    // Grafias possiveis de cada altura (a primeira e a preferida)
    var VARIANTS = [[[0, 0]], [[1, -1], [0, 1]], [[1, 0]], [[2, -1], [1, 1]], [[2, 0]], [[3, 0]],
        [[3, 1], [4, -1]], [[4, 0]], [[5, -1], [4, 1]], [[5, 0]], [[6, -1], [5, 1]], [[6, 0]]];
    var MAJ = [0, 2, 4, 5, 7, 9, 11];

    // ---------- Definicoes (s = semitons, l = deslocamento de letra) ----------
    function d(s, l, name, suffix) { return { s: s, l: l, name: name, suffix: suffix || "" }; }
    var T3 = [0, 2, 4], T4 = [0, 2, 4, 6];
    var CHORDS = [
        d([0, 4, 7], T3, "Maior", ""), d([0, 3, 7], T3, "Menor", "m"),
        d([0, 3, 6], T3, "Diminuto", "dim"), d([0, 4, 8], T3, "Aumentado", "aug"),
        d([0, 2, 7], [0, 1, 4], "Suspenso 2", "sus2"), d([0, 5, 7], [0, 3, 4], "Suspenso 4", "sus4"),
        d([0, 4, 7, 9], [0, 2, 4, 5], "Maior com Sexta", "6"), d([0, 3, 7, 9], [0, 2, 4, 5], "Menor com Sexta", "m6"),
        d([0, 4, 7, 9, 14], [0, 2, 4, 5, 1], "Sexta com Nona", "6/9"),
        d([0, 4, 7, 10], T4, "Sétima (dominante)", "7"), d([0, 4, 7, 11], T4, "Sétima Maior", "7M"),
        d([0, 3, 7, 10], T4, "Menor com Sétima", "m7"), d([0, 3, 7, 11], T4, "Menor com Sétima Maior", "m(7M)"),
        d([0, 3, 6, 10], T4, "Meio-diminuto", "m7(b5)"), d([0, 3, 6, 9], T4, "Diminuto com Sétima", "dim7"),
        d([0, 5, 7, 10], [0, 3, 4, 6], "Sétima com Quarta Suspensa", "7sus4"),
        d([0, 4, 8, 10], T4, "Sétima com Quinta Aumentada", "7(#5)"),
        d([0, 4, 6, 10], T4, "Sétima com Quinta Diminuta", "7(b5)"),
        d([0, 4, 7, 14], [0, 2, 4, 1], "Maior com Nona Adicionada", "add9"),
        d([0, 3, 7, 14], [0, 2, 4, 1], "Menor com Nona Adicionada", "m(add9)"),
        d([0, 4, 7, 10, 14], [0, 2, 4, 6, 1], "Nona (dominante)", "9"),
        d([0, 4, 7, 11, 14], [0, 2, 4, 6, 1], "Sétima Maior com Nona", "7M(9)"),
        d([0, 3, 7, 10, 14], [0, 2, 4, 6, 1], "Menor com Nona", "m9"),
        d([0, 4, 7, 10, 13], [0, 2, 4, 6, 1], "Sétima com Nona Menor", "7(b9)"),
        d([0, 4, 7, 10, 15], [0, 2, 4, 6, 1], "Sétima com Nona Aumentada", "7(#9)"),
        d([0, 4, 7, 10, 14, 17], [0, 2, 4, 6, 1, 3], "Onze (dominante)", "11"),
        d([0, 3, 7, 10, 14, 17], [0, 2, 4, 6, 1, 3], "Menor com Onze", "m11"),
        d([0, 4, 7, 10, 14, 21], [0, 2, 4, 6, 1, 5], "Treze (dominante)", "13"),
        d([0, 3, 7, 10, 14, 21], [0, 2, 4, 6, 1, 5], "Menor com Treze", "m13")
    ];
    var L7 = [0, 1, 2, 3, 4, 5, 6];
    var SCALES = [
        d([0, 2, 4, 5, 7, 9, 11], L7, "Maior Natural"), d([0, 2, 3, 5, 7, 8, 10], L7, "Menor Natural"),
        d([0, 2, 3, 5, 7, 8, 11], L7, "Menor Harmônica"), d([0, 2, 3, 5, 7, 9, 11], L7, "Menor Melódica"),
        d([0, 2, 4, 5, 7, 9, 11], L7, "Jônio"), d([0, 2, 3, 5, 7, 9, 10], L7, "Dórico"),
        d([0, 1, 3, 5, 7, 8, 10], L7, "Frígio"), d([0, 2, 4, 6, 7, 9, 11], L7, "Lídio"),
        d([0, 2, 4, 5, 7, 9, 10], L7, "Mixolídio"), d([0, 2, 3, 5, 7, 8, 10], L7, "Eólio"),
        d([0, 1, 3, 5, 6, 8, 10], L7, "Lócrio"),
        d([0, 2, 4, 6, 7, 9, 10], L7, "Lídio Dominante"), d([0, 1, 3, 4, 6, 8, 10], L7, "Alterada (Super Lócrio)"),
        d([0, 2, 4, 7, 9], [0, 1, 2, 4, 5], "Pentatônica Maior"), d([0, 3, 5, 7, 10], [0, 2, 3, 4, 6], "Pentatônica Menor"),
        d([0, 3, 5, 6, 7, 10], [0, 2, 3, 4, 4, 6], "Blues Menor"), d([0, 2, 3, 4, 7, 9], [0, 1, 2, 2, 4, 5], "Blues Maior"),
        d([0, 2, 4, 6, 8, 10], [0, 1, 2, 3, 4, 5], "Tons Inteiros"),
        d([0, 2, 3, 5, 6, 8, 9, 11], [0, 1, 2, 3, 4, 5, 5, 6], "Diminuta (tom-semitom)"),
        d([0, 1, 3, 4, 6, 7, 9, 10], [0, 1, 2, 2, 3, 4, 5, 6], "Diminuta (semitom-tom)"),
        d([0, 2, 3, 6, 7, 8, 11], L7, "Cigana Húngara"), d([0, 1, 4, 5, 7, 8, 10], L7, "Árabe (Dominante b2 b6)"),
        d([0, 3, 4, 6, 7, 9, 10], L7, "Húngara Maior"),
        d([0, 2, 4, 5, 7, 8, 9, 11], [0, 1, 2, 3, 4, 5, 5, 6], "Bebop Maior"),
        d([0, 2, 4, 5, 7, 9, 10, 11], [0, 1, 2, 3, 4, 5, 6, 6], "Bebop Dominante")
    ];

    // ---------- Grafia e formula ----------
    function accSign(a) { return a === 0 ? "" : a > 0 ? "♯♯".slice(0, a) : "♭♭".slice(0, -a); }
    function accSignC(a) { return a === 0 ? "" : a > 0 ? "##".slice(0, a) : "bb".slice(0, -a); }
    function spellWith(v, def) {
        var cost = 0, notes = def.s.map(function (semis, i) {
            var li = (v[0] + def.l[i]) % 7;
            var pc = (NAT[v[0]] + v[1] + semis) % 12;
            var acc = ((pc - NAT[li] + 18) % 12) - 6;
            cost += Math.abs(acc);
            return { pc: pc, pt: PT[li] + accSign(acc), cif: CIF[li] + accSignC(acc) };
        });
        return { notes: notes, cost: cost };
    }
    // Escolhe a grafia da tonica com menos acidentes
    function spell(tonicPc, def) {
        var best = null;
        VARIANTS[tonicPc].forEach(function (v) {
            var r = spellWith(v, def);
            if (!best || r.cost < best.cost) best = r;
        });
        return best.notes;
    }
    function degrees(def) {
        return def.s.map(function (semis, i) {
            var n = def.l[i] + 1 + (semis >= 12 ? 7 : 0);
            var base = MAJ[(n - 1) % 7] + (n > 7 ? 12 : 0);
            var diff = semis - base;
            return (diff < 0 ? "♭♭".slice(0, -diff) : diff > 0 ? "♯♯".slice(0, diff) : "") + n;
        });
    }

    // ---------- Estado e DOM ----------
    var $ = function (id) { return document.getElementById(id); };
    var kind = "acordes", defs = CHORDS, tonicPc = 0, def = CHORDS[0], target = null;
    var selected = {}, attempts = 2, finished = false, ac = null;

    var keysBox = $("keys"), result = $("buildResult"), titleEl = $("buildTitle"), subEl = $("buildSub");
    var selTom = $("selTom"), selTipo = $("selTipo");

    KEY_LABELS.forEach(function (lb, pc) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "key"; b.dataset.pc = pc;
        b.innerHTML = lb[0] + (lb[1] ? "<small>" + lb[1] + "</small>" : "<small>&nbsp;</small>");
        b.addEventListener("click", function () { toggle(pc); });
        keysBox.appendChild(b);
        var o = new Option(lb[1] ? lb[0] + " / " + lb[1] : lb[0], pc);
        selTom.add(o);
    });

    function play(pc, delay) {
        try {
            ac = ac || new (window.AudioContext || window.webkitAudioContext)();
            var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + (delay || 0);
            var midi = 60 + ((pc - tonicPc + 12) % 12);
            o.type = "triangle"; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
            o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.85);
        } catch (e) { /* sem audio */ }
    }

    function fillTypes() {
        selTipo.innerHTML = "";
        defs.forEach(function (df, i) {
            selTipo.add(new Option(kind === "acordes" ? df.name + (df.suffix ? " (" + df.suffix + ")" : "") : df.name, i));
        });
    }

    function newExercise() {
        tonicPc = +selTom.value; def = defs[+selTipo.value];
        var notes = spell(tonicPc, def);
        target = { notes: notes, set: {}, formula: degrees(def) };
        notes.forEach(function (n) { target.set[n.pc] = true; });
        selected = {}; selected[tonicPc] = true; attempts = 2; finished = false; shapes = []; shapeIdx = 0;
        var tonicName = notes[0].pt, cif = notes[0].cif;
        if (kind === "acordes") {
            titleEl.innerHTML = 'Construa o acorde <span class="gold">' + tonicName + " " + def.name + "</span>";
            subEl.textContent = "Cifra: " + cif + def.suffix + " · marque todas as notas do acorde (a tônica já está marcada).";
        } else {
            titleEl.innerHTML = 'Construa a escala <span class="gold">' + tonicName + " " + def.name + "</span>";
            subEl.textContent = "Marque todas as notas da escala (a tônica já está marcada).";
        }
        result.className = "build-result";
        $("btnCheck").disabled = false; $("btnNext").classList.add("d-none");
        renderKeys(); renderRef();
    }

    function randomExercise() {
        selTom.value = Math.floor(Math.random() * 12);
        selTipo.value = Math.floor(Math.random() * defs.length);
        newExercise();
    }

    // ---------- Braço do violão (afinação padrão E A D G B E) ----------
    var OPEN_PC = [4, 11, 7, 2, 9, 4]; // corda 1 (fina, no topo) ... corda 6 (grave)
    var STR_LOW = [4, 9, 2, 7, 11, 4]; // corda 6 (grave) ... corda 1
    var SVGNS = "http://www.w3.org/2000/svg", BW = 62, BX0 = 56, BY0 = 30, BDY = 28;
    var shapes = [], shapeIdx = 0;

    function svgEl(tag, attrs, txt) {
        var e = document.createElementNS(SVGNS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (txt != null) e.textContent = txt;
        $("board").appendChild(e); return e;
    }
    function dot(x, y, cls, label) {
        svgEl("circle", { cx: x, cy: y, r: 12, "class": cls });
        svgEl("text", { x: x, y: y, "class": "nt" }, label);
    }

    // Desenha a grade (casas f0..f1) e devolve as funcoes de posicao
    function setupGrid(f0, f1) {
        var fs = Math.max(f0, 1), n = f1 - fs + 1;
        var svg = $("board"), W = BX0 + n * BW + 20, H = BY0 + 5 * BDY + 46;
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        svg.innerHTML = "";
        var xs = function (f) { return BX0 + (f - fs + 0.5) * BW; };
        var g = {
            xd: function (f) { return f === 0 ? BX0 - 18 : xs(f); },
            ys: function (i) { return BY0 + i * BDY; }
        };
        [3, 5, 7, 9].forEach(function (f) { if (f >= f0 && f <= f1) svgEl("circle", { cx: xs(f), cy: (g.ys(0) + g.ys(5)) / 2, r: 8, "class": "inlay" }); });
        if (f1 >= 12 && 12 >= f0) {
            svgEl("circle", { cx: xs(12), cy: g.ys(1) + BDY / 2, r: 8, "class": "inlay" });
            svgEl("circle", { cx: xs(12), cy: g.ys(4) - BDY / 2, r: 8, "class": "inlay" });
        }
        for (var i = 0; i <= n; i++) {
            var x = BX0 + i * BW;
            svgEl("line", { x1: x, x2: x, y1: g.ys(0), y2: g.ys(5), "class": (i === 0 && f0 === 0) ? "nut" : "fret" });
        }
        for (var f = fs; f <= f1; f++) svgEl("text", { x: xs(f), y: g.ys(5) + 26, "class": "fnum" }, f);
        for (var st = 0; st < 6; st++) {
            svgEl("line", { x1: BX0, x2: BX0 + n * BW, y1: g.ys(st), y2: g.ys(st), "class": "str", "stroke-width": 1 + st * 0.5 });
            svgEl("text", { x: 14, y: g.ys(st) + 5, "class": "snum" }, st + 1);
        }
        return g;
    }

    // Escalas: todas as posicoes da resposta (ou das notas marcadas) no braço
    function drawBoard(reveal) {
        var rg = $("selRegiao").value.split("-"), f0 = +rg[0], f1 = +rg[1];
        var g = setupGrid(f0, f1);
        var names = {};
        if (reveal) target.notes.forEach(function (nt) { names[nt.pc] = nt.pt; });
        for (var st = 0; st < 6; st++) {
            for (var fr = f0; fr <= f1; fr++) {
                var pc = (OPEN_PC[st] + fr) % 12;
                if (!(reveal ? target.set[pc] : selected[pc])) continue;
                dot(g.xd(fr), g.ys(st), pc === tonicPc ? "nd tonic" : (reveal ? "nd ok" : "nd sel"), names[pc] || KEY_LABELS[pc][0]);
            }
        }
    }

    // ---------- Acordes: forma tocavel (voicing) ----------
    // Procura formas com ate 4 dedos (pestana conta como 1), dentro de 4 casas, sem cordas
    // abafadas no meio e com a tonica no baixo. As notas essenciais (tonica, terca, setima,
    // extensoes) sao obrigatorias; a quinta pode ser omitida em acordes de 4+ notas.
    function findShapes(root, tones) {
        var pcSet = {}; tones.forEach(function (t) { pcSet[t.pc] = true; });
        var many = tones.length >= 4;
        function reqSet(level) {
            var r = {};
            tones.forEach(function (t) {
                var skip5 = many && t.s % 12 === 7;
                var skipExt = (level >= 1 && t.s >= 12) || (tones.length >= 6 && t.s >= 12 && t.s < 16);
                var onlyCore = level >= 2 && t.s % 12 !== 0 && ![3, 4, 2, 5, 9, 10, 11].includes(t.s % 12);
                if (!skip5 && !skipExt && !onlyCore) r[t.pc] = true;
            });
            r[root] = true; return r;
        }
        var results = {};
        function evaluate(v, req, rootBass) {
            var sounding = [], i;
            for (i = 0; i < 6; i++) if (v[i] >= 0) sounding.push(i);
            if (sounding.length < 3) return;
            var lo = sounding[0], hi = sounding[sounding.length - 1];
            for (i = lo; i <= hi; i++) if (v[i] < 0) return;            // sem abafadas no meio
            if (rootBass && (STR_LOW[lo] + v[lo]) % 12 !== root) return;
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
            if (!results[key]) results[key] = { v: v.slice(), cost: cost, barre: barre, base: m };
        }
        function run(req, rootBass) {
            for (var lo = 1; lo <= 10; lo++) {
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

    function pickShapes() {
        var tones = def.s.map(function (semis, i) { return { pc: target.notes[i].pc, s: semis }; });
        var all = findShapes(tonicPc, tones), out = [], bases = {};
        // formas com casas iniciais diferentes (mais simples primeiro), no maximo 6
        all.forEach(function (sh) {
            if (out.length < 6 && !bases[sh.base]) { bases[sh.base] = true; out.push(sh); }
        });
        shapes = out; shapeIdx = 0;
    }

    function drawShape() {
        var sh = shapes[shapeIdx];
        if (!sh) { $("board").innerHTML = ""; $("shapeInfo").textContent = "Não encontrei uma forma simples para este acorde."; return; }
        var v = sh.v, frets = v.filter(function (f) { return f > 0; });
        var hasOpen = v.some(function (f) { return f === 0; });
        var top = Math.max.apply(null, frets), bot = Math.min.apply(null, frets);
        var f0 = (hasOpen || bot <= 2) ? 0 : bot, f1 = Math.max(top, f0 === 0 ? 4 : bot + 3);
        var g = setupGrid(f0, f1);
        var names = {}; target.notes.forEach(function (nt) { names[nt.pc] = nt.pt; });
        for (var row = 0; row < 6; row++) {
            var k = 5 - row, f = v[k], y = g.ys(row), x0 = BX0 - 18;
            if (f < 0) { svgEl("text", { x: x0, y: y + 5, "class": "mute" }, "×"); continue; }
            var pc = (STR_LOW[k] + f) % 12, cls = pc === tonicPc ? "nd tonic" : "nd ok";
            if (f === 0) { svgEl("circle", { cx: x0, cy: y, r: 12, "class": cls + " open" }); svgEl("text", { x: x0, y: y, "class": "nt" }, names[pc]); }
            else dot(g.xd(f), y, cls, names[pc]);
        }
        if (sh.barre) {
            var bs = [];
            for (var q = 0; q < 6; q++) if (v[q] === sh.base) bs.push(5 - q);
            var bx = g.xd(sh.base);
            svgEl("rect", { x: bx - 16, y: g.ys(Math.min.apply(null, bs)) - 16, width: 32, height: g.ys(Math.max.apply(null, bs)) - g.ys(Math.min.apply(null, bs)) + 32, rx: 16, "class": "barre" });
        }
        var pos = sh.base === 0 ? "formato aberto" : "a partir da " + (f0 || sh.base) + "ª casa" + (sh.barre ? " (com pestana)" : "");
        $("shapeInfo").textContent = "Forma " + (shapeIdx + 1) + " de " + shapes.length + " · " + pos;
    }

    // Mostra o painel certo: acordes = forma tocavel; escalas = notas em todo o braço
    function renderBoard(reveal) {
        var chord = kind === "acordes";
        $("selRegiao").classList.toggle("d-none", chord);
        $("btnShape").classList.toggle("d-none", !chord);
        $("shapeInfo").classList.toggle("d-none", !chord);
        $("boardLegend").classList.toggle("d-none", chord);
        $("boardTitle").textContent = chord ? "O acorde no braço do violão" : "Notas da escala no braço do violão";
        $("boardWrap").classList.toggle("d-none", chord && !reveal);
        $("boardWrap").classList.toggle("is-shape", chord);
        $("boardHint").classList.toggle("d-none", !(chord && !reveal));
        if (!chord) { drawBoard(reveal); return; }
        if (reveal) { if (!shapes.length) pickShapes(); drawShape(); }
    }

    function renderKeys(reveal) {
        renderBoard(!!reveal);
        keysBox.querySelectorAll(".key").forEach(function (b) {
            var pc = +b.dataset.pc;
            b.className = "key" + (pc === tonicPc ? " tonic" : "") + (selected[pc] ? " sel" : "");
            b.disabled = finished;
            if (reveal) {
                if (selected[pc] && target.set[pc]) b.className = "key ok" + (pc === tonicPc ? " tonic" : "");
                else if (selected[pc] && !target.set[pc]) b.className = "key bad";
                else if (!selected[pc] && target.set[pc]) b.className = "key miss";
            }
        });
    }

    function toggle(pc) {
        if (finished || pc === tonicPc) { play(pc); return; }
        selected[pc] = !selected[pc];
        if (selected[pc]) play(pc);
        renderKeys();
    }

    function showResult(ok, html) {
        result.className = "build-result show " + (ok ? "good" : "bad");
        result.innerHTML = html;
    }

    function answerHtml() {
        return target.notes.map(function (n) { return n.pt; }).join(" · ") +
            '<span class="formula">Fórmula: ' + target.formula.join(" – ") + "</span>";
    }

    function check() {
        if (finished) return;
        var miss = 0, extra = 0, pc;
        for (pc = 0; pc < 12; pc++) {
            if (target.set[pc] && !selected[pc]) miss++;
            if (!target.set[pc] && selected[pc]) extra++;
        }
        if (!miss && !extra) {
            finished = true; renderKeys(true);
            showResult(true, "✅ Correto! " + answerHtml());
            endRound(); return;
        }
        attempts--;
        if (attempts > 0) {
            showResult(false, "❌ Ainda não está certo: " + (miss ? "faltam " + miss + " nota(s)" : "") +
                (miss && extra ? " e " : "") + (extra ? "há " + extra + " nota(s) a mais" : "") + ". Você tem mais 1 chance.");
            return;
        }
        finished = true; renderKeys(true);
        showResult(false, "❌ Você não conseguiu desta vez. A resposta correta: " + answerHtml());
        endRound();
    }

    function endRound() {
        $("btnCheck").disabled = true;
        $("btnNext").classList.remove("d-none");
    }

    function listen() {
        target.notes.forEach(function (n, i) { play(n.pc, kind === "acordes" ? 0 : i * 0.35); });
    }

    // ---------- Tabela de consulta: todos os tipos no tom atual ----------
    function renderRef() {
        var html = '<table class="ref-table"><thead><tr><th>' + (kind === "acordes" ? "Acorde" : "Escala") +
            "</th><th>Notas</th><th>Fórmula</th></tr></thead><tbody>";
        defs.forEach(function (df) {
            var ns = spell(tonicPc, df);
            var nm = kind === "acordes" ? ns[0].cif + df.suffix + " · " + df.name : ns[0].pt + " " + df.name;
            html += "<tr><td>" + nm + "</td><td>" + ns.map(function (n) { return n.pt; }).join(" · ") +
                '</td><td class="f">' + degrees(df).join(" – ") + "</td></tr>";
        });
        $("refBody").innerHTML = html + "</tbody></table>";
    }

    function setKind(k) {
        kind = k; defs = k === "acordes" ? CHORDS : SCALES;
        document.querySelectorAll(".build-tab").forEach(function (t) { t.classList.toggle("active", t.dataset.kind === k); });
        $("refTitle").textContent = k === "acordes" ? "Todos os acordes neste tom" : "Todas as escalas neste tom";
        fillTypes(); selTipo.value = 0; newExercise();
    }

    document.querySelectorAll(".build-tab").forEach(function (t) {
        t.addEventListener("click", function () { history.replaceState(null, "", "#" + t.dataset.kind); setKind(t.dataset.kind); });
    });
    $("selRegiao").addEventListener("change", function () { drawBoard(finished); });
    $("btnShape").addEventListener("click", function () { if (shapes.length) { shapeIdx = (shapeIdx + 1) % shapes.length; drawShape(); } });
    selTom.addEventListener("change", function () { newExercise(); });
    selTipo.addEventListener("change", function () { newExercise(); });
    $("btnCheck").addEventListener("click", check);
    $("btnRandom").addEventListener("click", randomExercise);
    $("btnNext").addEventListener("click", randomExercise);
    $("btnListen").addEventListener("click", listen);
    $("btnClear").addEventListener("click", function () {
        if (finished) return; selected = {}; selected[tonicPc] = true; renderKeys();
    });
    $("btnReveal").addEventListener("click", function () {
        if (finished) return; finished = true; renderKeys(true);
        showResult(false, "A resposta correta: " + answerHtml()); endRound();
    });
    window.addEventListener("hashchange", function () { setKind(location.hash === "#escalas" ? "escalas" : "acordes"); });

    setKind(location.hash === "#escalas" ? "escalas" : "acordes");
})();
