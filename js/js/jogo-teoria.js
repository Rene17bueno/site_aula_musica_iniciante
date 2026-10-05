// Jogos de teoria: "Nome da escala" (body data-mode="escalas") e
// "Notas do acorde" (data-mode="notas"). As perguntas sao geradas por formula
// (grafia correta das notas: cada grau usa a sua letra), sem listas manuais.
(function () {
    "use strict";

    var MODE = document.body.dataset.mode;
    var TARGET_COMBO = 10;
    var MAX_ATTEMPTS = 2;

    // ---------- Teoria ----------
    var PT = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
    var CIF = ["C", "D", "E", "F", "G", "A", "B"];
    var NAT = [0, 2, 4, 5, 7, 9, 11];
    // Tonicas: letra (0=Dó..6=Si) + acidente (-1 bemol, 0, +1 sustenido)
    var TONICS = [
        { l: 0, a: 0 }, { l: 1, a: 0 }, { l: 2, a: 0 }, { l: 3, a: 0 }, { l: 4, a: 0 }, { l: 5, a: 0 }, { l: 6, a: 0 },
        { l: 6, a: -1 }, { l: 2, a: -1 }, { l: 5, a: -1 }, { l: 1, a: -1 }, { l: 3, a: 1 }
    ];

    // Escreve a nota de um grau: devolve null se precisar de dobrado sustenido/bemol.
    function spell(t, semis, letterOffset) {
        var li = (t.l + letterOffset) % 7;
        var pc = (NAT[t.l] + t.a + semis) % 12;
        var acc = ((pc - NAT[li] + 18) % 12) - 6;
        if (Math.abs(acc) > 1) return null;
        var sign = acc === 1 ? "♯" : acc === -1 ? "♭" : "";
        return { pt: PT[li] + sign, cif: CIF[li] + (acc === 1 ? "#" : acc === -1 ? "b" : "") };
    }

    function spellAll(t, def) {
        var out = [];
        for (var i = 0; i < def.s.length; i++) {
            var n = spell(t, def.s[i], def.l[i]);
            if (!n) return null;
            out.push(n);
        }
        return out;
    }

    // s = semitons a partir da tonica; l = deslocamento de letra de cada grau
    var SCALES = {
        "Maior": { s: [0, 2, 4, 5, 7, 9, 11], l: [0, 1, 2, 3, 4, 5, 6] },
        "Menor Natural": { s: [0, 2, 3, 5, 7, 8, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Menor Harmônica": { s: [0, 2, 3, 5, 7, 8, 11], l: [0, 1, 2, 3, 4, 5, 6] },
        "Menor Melódica": { s: [0, 2, 3, 5, 7, 9, 11], l: [0, 1, 2, 3, 4, 5, 6] },
        "Jônio (Maior)": { s: [0, 2, 4, 5, 7, 9, 11], l: [0, 1, 2, 3, 4, 5, 6] },
        "Dórico": { s: [0, 2, 3, 5, 7, 9, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Frígio": { s: [0, 1, 3, 5, 7, 8, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Lídio": { s: [0, 2, 4, 6, 7, 9, 11], l: [0, 1, 2, 3, 4, 5, 6] },
        "Mixolídio": { s: [0, 2, 4, 5, 7, 9, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Eólio (Menor Natural)": { s: [0, 2, 3, 5, 7, 8, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Lócrio": { s: [0, 1, 3, 5, 6, 8, 10], l: [0, 1, 2, 3, 4, 5, 6] },
        "Pentatônica Maior": { s: [0, 2, 4, 7, 9], l: [0, 1, 2, 4, 5] },
        "Pentatônica Menor": { s: [0, 3, 5, 7, 10], l: [0, 2, 3, 4, 6] },
        "Blues": { s: [0, 3, 5, 6, 7, 10], l: [0, 2, 3, 4, 4, 6] },
        "Tons Inteiros": { s: [0, 2, 4, 6, 8, 10], l: [0, 1, 2, 3, 4, 5] }
    };

    var CHORDS = {
        "": { s: [0, 4, 7], l: [0, 2, 4], label: "Maior" },
        "m": { s: [0, 3, 7], l: [0, 2, 4], label: "Menor" },
        "dim": { s: [0, 3, 6], l: [0, 2, 4], label: "Diminuto" },
        "aug": { s: [0, 4, 8], l: [0, 2, 4], label: "Aumentado" },
        "7": { s: [0, 4, 7, 10], l: [0, 2, 4, 6], label: "Sétima (dominante)" },
        "7M": { s: [0, 4, 7, 11], l: [0, 2, 4, 6], label: "Sétima Maior" },
        "m7": { s: [0, 3, 7, 10], l: [0, 2, 4, 6], label: "Menor com Sétima" },
        "m7(b5)": { s: [0, 3, 6, 10], l: [0, 2, 4, 6], label: "Meio-diminuto" },
        "6": { s: [0, 4, 7, 9], l: [0, 2, 4, 5], label: "Maior com Sexta" },
        "m6": { s: [0, 3, 7, 9], l: [0, 2, 4, 5], label: "Menor com Sexta" },
        "9": { s: [0, 4, 7, 10, 14], l: [0, 2, 4, 6, 1], label: "Nona (dominante)" },
        "7M(9)": { s: [0, 4, 7, 11, 14], l: [0, 2, 4, 6, 1], label: "Sétima Maior com Nona" },
        "m9": { s: [0, 3, 7, 10, 14], l: [0, 2, 4, 6, 1], label: "Menor com Nona" },
        "sus2": { s: [0, 2, 7], l: [0, 1, 4], label: "Suspenso 2" },
        "sus4": { s: [0, 5, 7], l: [0, 3, 4], label: "Suspenso 4" }
    };

    // ---------- Fases ----------
    // ask = o que pode ser perguntado; pool = de onde saem as alternativas
    var LEVELS = MODE === "escalas" ? [
        { name: "Fase 1: Maior e Menores", desc: "Maior, Menor Natural, Harmônica e Melódica",
          ask: ["Maior", "Menor Natural", "Menor Harmônica", "Menor Melódica"],
          pool: ["Maior", "Menor Natural", "Menor Harmônica", "Menor Melódica"] },
        { name: "Fase 2: Modos Gregos", desc: "Jônio, Dórico, Frígio, Lídio, Mixolídio, Eólio e Lócrio",
          ask: ["Jônio (Maior)", "Dórico", "Frígio", "Lídio", "Mixolídio", "Eólio (Menor Natural)", "Lócrio"],
          pool: ["Jônio (Maior)", "Dórico", "Frígio", "Lídio", "Mixolídio", "Eólio (Menor Natural)", "Lócrio"] },
        { name: "Fase 3: Pentatônicas e Blues", desc: "Pentatônicas, Blues e Tons Inteiros",
          ask: ["Pentatônica Maior", "Pentatônica Menor", "Blues", "Tons Inteiros"],
          pool: ["Pentatônica Maior", "Pentatônica Menor", "Blues", "Tons Inteiros"] }
    ] : [
        { name: "Fase 1: Maiores e Menores", desc: "Tríades maiores e menores",
          ask: ["", "m"], pool: ["", "m", "dim", "aug"] },
        { name: "Fase 2: Com Sétima", desc: "7, 7M e m7",
          ask: ["7", "7M", "m7"], pool: ["7", "7M", "m7", "m7(b5)"] },
        { name: "Fase 3: Com Sexta", desc: "6 e m6",
          ask: ["6", "m6"], pool: ["6", "m6", "", "m"] },
        { name: "Fase 4: Com Nona", desc: "9, 7M(9) e m9",
          ask: ["9", "7M(9)", "m9"], pool: ["9", "7M(9)", "m9", "7"] },
        { name: "Fase 5: Suspensos, Diminutos e Aumentados", desc: "sus2, sus4, dim e aug",
          ask: ["sus2", "sus4", "dim", "aug"], pool: ["sus2", "sus4", "dim", "aug"] }
    ];

    // ---------- Estado e DOM ----------
    var levelIndex = 0, combo = 0, attemptsLeft = MAX_ATTEMPTS, current = null;
    var $ = function (id) { return document.getElementById(id); };
    var levelBadge = $("levelBadgeDisplay"), comboCounter = $("comboCounter"), progressBar = $("progressBar"),
        questionBox = $("questionBox"), optionsBox = $("optionsContainer"), feedbackBox = $("feedbackBox"),
        levelSelector = $("levelSelector");

    function shuffle(arr) { return arr.slice().sort(function () { return Math.random() - 0.5; }); }
    function esc(v) {
        return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // ---------- Perguntas ----------
    function buildQuestion() {
        var lvl = LEVELS[levelIndex];
        for (var tries = 0; tries < 60; tries++) {
            var key = lvl.ask[Math.floor(Math.random() * lvl.ask.length)];
            var t = TONICS[Math.floor(Math.random() * TONICS.length)];
            var def = MODE === "escalas" ? SCALES[key] : CHORDS[key];
            var notes = spellAll(t, def);
            if (!notes) continue;
            var tonicPt = notes[0].pt, tonicCif = notes[0].cif;
            var label = function (k) {
                return MODE === "escalas" ? tonicPt + " " + k : tonicCif + k;
            };
            var wrong = shuffle(lvl.pool.filter(function (k) { return k !== key; })).slice(0, 3).map(label);
            var q = {
                notes: notes.map(function (n) { return n.pt; }).join(" · "),
                tonic: tonicPt,
                correct: label(key),
                options: shuffle(wrong.concat(label(key)))
            };
            if (current && q.correct === current.correct && q.notes === current.notes) continue;
            return q;
        }
        return null;
    }

    function renderQuestion() {
        hideFeedback();
        attemptsLeft = MAX_ATTEMPTS;
        current = buildQuestion();
        if (MODE === "escalas") {
            questionBox.innerHTML = 'Escala com tônica <span class="gold">' + esc(current.tonic) + '</span>:<br>' +
                '<span class="d-block fs-5 mt-2">' + esc(current.notes) + '</span>' +
                '<span class="d-block fs-6 mt-3 text-muted">Qual é o nome desta escala?</span>';
        } else {
            questionBox.innerHTML = 'As notas <span class="gold">' + esc(current.notes) + '</span><br>' +
                '<span class="d-block fs-6 mt-3 text-muted">formam qual acorde?</span>';
        }
        optionsBox.innerHTML = "";
        current.options.forEach(function (opt) {
            var col = document.createElement("div");
            col.className = "col";
            var btn = document.createElement("button");
            btn.className = "option-btn";
            btn.textContent = opt;
            btn.addEventListener("click", function () { checkAnswer(opt); });
            col.appendChild(btn);
            optionsBox.appendChild(col);
        });
    }

    function checkAnswer(opt) {
        var buttons = optionsBox.querySelectorAll(".option-btn");
        if (opt === current.correct) {
            buttons.forEach(function (b) { b.disabled = true; });
            combo++;
            if (window.GameRanking) window.GameRanking.record(attemptsLeft === MAX_ATTEMPTS ? 10 : 5);
            showFeedback(true, '✨ Isso mesmo! "' + opt + '" está correto.');
            if (combo >= TARGET_COMBO) {
                updateProgress();
                setTimeout(advanceLevel, 1800);
                return;
            }
        } else {
            attemptsLeft--;
            buttons.forEach(function (b) {
                if (b.textContent === opt) { b.disabled = true; b.classList.add("wrong"); }
            });
            if (attemptsLeft > 0) {
                showFeedback(false, "❌ Errou! Você ainda tem " + attemptsLeft + " chance. Tente de novo.");
                return;
            }
            buttons.forEach(function (b) {
                b.disabled = true;
                if (b.textContent === current.correct) b.classList.add("correct");
            });
            combo = 0;
            showFeedback(false, '❌ Você não conseguiu desta vez. A resposta correta era "' + current.correct + '". O combo reiniciou.');
            updateProgress();
            var next = document.createElement("button");
            next.type = "button";
            next.className = "btn-next-question";
            next.textContent = "Próxima pergunta ➜";
            next.addEventListener("click", renderQuestion);
            feedbackBox.appendChild(next);
            return;
        }
        updateProgress();
        setTimeout(renderQuestion, 1800);
    }

    function showFeedback(ok, msg) {
        feedbackBox.innerText = msg;
        feedbackBox.className = "feedback-area p-3 mb-2 show " + (ok ? "feedback-correct" : "feedback-incorrect");
    }
    function hideFeedback() { feedbackBox.className = "feedback-area p-3 mb-2"; }

    function updateProgress() {
        comboCounter.innerText = combo;
        progressBar.style.width = (combo / TARGET_COMBO * 100) + "%";
        levelBadge.innerText = LEVELS[levelIndex].name;
    }

    function advanceLevel() {
        if (levelIndex < LEVELS.length - 1) {
            alert("🎉 Parabéns! Você completou 10 acertos seguidos e subiu para a próxima fase!");
            loadLevel(levelIndex + 1);
        } else {
            alert("🏆 Incrível! Você completou todas as fases deste desafio!");
            loadLevel(0);
        }
    }

    function renderSelector() {
        levelSelector.innerHTML = "";
        LEVELS.forEach(function (lvl, idx) {
            var btn = document.createElement("button");
            btn.className = "btn-level-select" + (idx === levelIndex ? " active" : "");
            btn.id = "lvl-select-" + idx;
            btn.innerHTML = '<div class="level-title"><i class="fas fa-music me-2 gold"></i>' + esc(lvl.name) +
                '</div><div class="level-desc">' + esc(lvl.desc) + '</div>';
            btn.addEventListener("click", function () { loadLevel(idx); });
            levelSelector.appendChild(btn);
        });
    }

    function loadLevel(idx) {
        levelIndex = idx;
        combo = 0;
        renderSelector();
        updateProgress();
        renderQuestion();
    }

    loadLevel(0);
})();
