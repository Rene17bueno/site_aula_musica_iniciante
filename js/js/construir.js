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
        selected = {}; selected[tonicPc] = true; attempts = 2; finished = false;
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
    var SVGNS = "http://www.w3.org/2000/svg", BW = 62, BX0 = 56, BY0 = 30, BDY = 28;
    function svgEl(tag, attrs, txt) {
        var e = document.createElementNS(SVGNS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (txt != null) e.textContent = txt;
        $("board").appendChild(e); return e;
    }
    function drawBoard(reveal) {
        var rg = $("selRegiao").value.split("-"), f0 = +rg[0], f1 = +rg[1], fs = Math.max(f0, 1), n = f1 - fs + 1;
        var svg = $("board"), W = BX0 + n * BW + 20, H = BY0 + 5 * BDY + 46;
        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        svg.innerHTML = "";
        var xs = function (f) { return BX0 + (f - fs + 0.5) * BW; };       // centro da casa f (f >= 1)
        var xd = function (f) { return f === 0 ? BX0 - 18 : xs(f); };    // casa 0 = corda solta, a esquerda da pestana
        var ys = function (i) { return BY0 + i * BDY; };
        [3, 5, 7, 9].forEach(function (f) { if (f >= f0 && f <= f1) svgEl("circle", { cx: xs(f), cy: (ys(0) + ys(5)) / 2, r: 8, "class": "inlay" }); });
        if (f1 >= 12 && 12 >= f0) {
            svgEl("circle", { cx: xs(12), cy: ys(1) + BDY / 2, r: 8, "class": "inlay" });
            svgEl("circle", { cx: xs(12), cy: ys(4) - BDY / 2, r: 8, "class": "inlay" });
        }
        for (var i = 0; i <= n; i++) {
            var x = BX0 + i * BW;
            svgEl("line", { x1: x, x2: x, y1: ys(0), y2: ys(5), "class": (i === 0 && f0 === 0) ? "nut" : "fret" });
        }
        for (var f = fs; f <= f1; f++) svgEl("text", { x: xs(f), y: ys(5) + 26, "class": "fnum" }, f);
        if (f0 === 0) svgEl("text", { x: BX0 - 18, y: ys(5) + 26, "class": "fnum" }, "0");
        for (var s = 0; s < 6; s++) {
            svgEl("line", { x1: BX0, x2: BX0 + n * BW, y1: ys(s), y2: ys(s), "class": "str", "stroke-width": 1 + s * 0.5 });
            svgEl("text", { x: 14, y: ys(s) + 5, "class": "snum" }, s + 1);
        }
        var names = {};
        if (reveal) target.notes.forEach(function (nt) { names[nt.pc] = nt.pt; });
        for (var st = 0; st < 6; st++) {
            for (var fr = f0; fr <= f1; fr++) {
                var pc = (OPEN_PC[st] + fr) % 12;
                var on = reveal ? target.set[pc] : selected[pc];
                if (!on) continue;
                var cls = pc === tonicPc ? "nd tonic" : (reveal ? "nd ok" : "nd sel");
                svgEl("circle", { cx: xd(fr), cy: ys(st), r: 12, "class": cls });
                svgEl("text", { x: xd(fr), y: ys(st), "class": "nt" }, names[pc] || KEY_LABELS[pc][0]);
            }
        }
    }

    function renderKeys(reveal) {
        drawBoard(!!reveal);
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
