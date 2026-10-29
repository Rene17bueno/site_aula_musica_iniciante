// ============================================================
// LAYOUT COMPARTILHADO / SHARED LAYOUT / DISEÑO COMPARTIDO
// Navbar, rodapé e seletor de idioma reutilizados em todas as
// páginas. Detecta o idioma pela URL (/en/ ou /es/) e injeta o
// markup traduzido nos placeholders #site-navbar e #site-footer.
// ============================================================

(function () {
    "use strict";

    // ---- Detecção de idioma pela URL -----------------------
    var path = window.location.pathname;
    var LANG = "pt";
    if (/\/en(\/|$)/.test(path)) LANG = "en";
    else if (/\/es(\/|$)/.test(path)) LANG = "es";

    // Nome do arquivo atual (ex.: "capitulo4.html")
    var file = path.split("/").pop();
    if (!file) file = "index.html";

    // Páginas que já possuem versão traduzida em /en/ e /es/
    var TRANSLATED = {
        "index.html": 1,
        "capitulo1.html": 1, "capitulo2.html": 1, "capitulo3.html": 1,
        "capitulo4.html": 1, "capitulo5.html": 1, "capitulo6.html": 1,
        "capitulo7.html": 1, "capitulo8.html": 1, "capitulo9.html": 1,
        "capitulo10.html": 1, "capitulo11.html": 1, "capitulo12.html": 1,
        "capitulo13.html": 1
    };

    // ---- Dicionário de textos da interface -----------------
    var T = {
        pt: {
            home: "Início", lessons: "Aulas", chapters: "Capítulos", chapter: "Capítulo",
            chords: "Acordes", exercises: "Exercícios", games: "Jogos",
            visualChallenge: "Desafio Visual", noteId: "Identificação de Notas", fretGames: "Jogos do Braço",
            trail: "Comece aqui", practice: "Praticar", changes: "Trocas de acordes", tuner: "Afinador", technique: "Técnica e saúde", map: "Mapa do braço", metro: "Metrônomo", inst: "Instrumentos", community: "Comunidade", attendance: "Presença", adminPanel: "Painel Admin",
            navBrand: "<span>Música</span> &middot; Iniciante",
            footBrand: "<span>Aula de Música</span> Iniciante", catholic: "Músico Católico", catholicSub: "Cifras e repertórios para a missa"
        },
        en: {
            home: "Home", lessons: "Lessons (PT)", chapters: "Chapters", chapter: "Chapter",
            chords: "Chords", exercises: "Exercises (PT)", games: "Games",
            visualChallenge: "Visual Challenge", noteId: "Note Identification", fretGames: "Fretboard Games (PT)",
            trail: "Start here (PT)", practice: "Practice", changes: "Chord changes (PT)", tuner: "Tuner (PT)", technique: "Technique (PT)", map: "Fretboard map (PT)", metro: "Metronome (PT)", inst: "Instruments (PT)", community: "Community", attendance: "Attendance", adminPanel: "Admin Panel",
            navBrand: "<span>Music</span> &middot; Beginner",
            footBrand: "<span>Beginner</span> Music Lessons", catholic: "Catholic Musician", catholicSub: "Chord sheets for Mass (PT)"
        },
        es: {
            home: "Inicio", lessons: "Clases (PT)", chapters: "Capítulos", chapter: "Capítulo",
            chords: "Acordes", exercises: "Ejercicios (PT)", games: "Juegos",
            visualChallenge: "Desafío Visual", noteId: "Identificación de Notas", fretGames: "Juegos del Brazo (PT)",
            trail: "Empieza aquí (PT)", practice: "Practicar", changes: "Cambios de acordes (PT)", tuner: "Afinador (PT)", technique: "Técnica (PT)", map: "Mapa del mástil (PT)", metro: "Metrónomo (PT)", inst: "Instrumentos (PT)", community: "Comunidad", attendance: "Asistencia", adminPanel: "Panel de Administración",
            navBrand: "<span>Música</span> &middot; Principiante",
            footBrand: "<span>Clases de Música</span> para Principiantes", catholic: "Músico Católico", catholicSub: "Cifras e repertórios para a missa"
        }
    };
    var t = T[LANG];

    // ---- Instrumento escolhido (vale para o site inteiro) ---
    var INSTS = [
        { id: "violao",   i: "fa-guitar",      home: "index.html",    n: { pt: "Violão", en: "Acoustic guitar", es: "Guitarra acústica" } },
        { id: "teclado",  i: "fa-keyboard",    home: "teclado.html",  n: { pt: "Teclado", en: "Keyboard", es: "Teclado" } },
        { id: "guitarra", i: "fa-bolt",        home: "guitarra.html", n: { pt: "Guitarra", en: "Electric guitar", es: "Guitarra eléctrica" } },
        { id: "baixo",    i: "fa-wave-square", home: "baixo.html",    n: { pt: "Baixo elétrico", en: "Electric bass", es: "Bajo eléctrico" } }
    ];
    var SOON = [
        { id: "violino",    page: "violino.html",    n: { pt: "Violino", en: "Violin", es: "Violín" } },
        { id: "violoncelo", page: "violoncelo.html", n: { pt: "Violoncelo", en: "Cello", es: "Violonchelo" } }
    ];
    var INST_DESC = {
        violao: "12 semanas, acordes, levadas, jogos de braço e as aulas em vídeo.",
        teclado: "Piano, órgão e cordas. Acordes e escalas acesos nas teclas, jogo das teclas e MIDI.",
        guitarra: "Sons limpo, crunch e distorcido. Power chords, pentatônicas e caixas no braço.",
        baixo: "Braço de 4 cordas, escalas e linhas de baixo sobre o campo harmônico."
    };
    var INST_KEY = "instrumento";
    function instStored() { try { var v = localStorage.getItem(INST_KEY); return INSTS.some(function (x) { return x.id === v; }) ? v : null; } catch (e) { return null; } }
    var INST_ID = instStored() || "violao";
    function instById(id) { return INSTS.filter(function (x) { return x.id === id; })[0]; }
    function instName(x) { return x.n[LANG] || x.n.pt; }
    var CUR = instById(INST_ID);
    // Quais instrumentos a página aceita: <body data-inst="violao,guitarra">
    function pageInsts() { var d = document.body && document.body.getAttribute("data-inst"); return d ? d.split(",") : null; }
    function pageOk(id) { var l = pageInsts(); return !l || l.indexOf(id) >= 0; }
    window.Inst = {
        lista: INSTS, atual: function () { return INST_ID; }, definido: function () { return !!instStored(); },
        nome: function (id) { return instName(instById(id || INST_ID)); },
        set: function (id) { if (!instById(id)) return; try { localStorage.setItem(INST_KEY, id); } catch (e) {} INST_ID = id; CUR = instById(id); },
        // escolhe e vai para onde faz sentido: recarrega a página, ou volta ao início se ela não serve ao novo instrumento
        escolher: function (id, destino) {
            this.set(id);
            if (destino) { location.href = (LANG === "pt" ? "" : "../") + destino; return; }
            if (pageOk(id)) location.reload(); else location.href = (LANG === "pt" ? "" : "../") + "index.html";
        },
        cartoes: function (el, opt) {
            opt = opt || {};
            var h = INSTS.map(function (x) {
                return '<div class="col-md-6 col-lg-4"><a href="#" class="game-card inst-card' + (x.id === INST_ID && Inst.definido() ? " sel" : "") + '" data-set="' + x.id + '"><div class="d-flex justify-content-between align-items-start mb-2"><i class="fas ' + x.i + ' gold inst-ico"></i>' +
                    (x.id === INST_ID && Inst.definido() ? '<span class="inst-tag ok">Seu instrumento</span>' : '<span class="inst-tag">Escolher</span>') + '</div><h5 class="fw-bold gold mb-1">' + x.n.pt + '</h5><p class="text-muted small mb-0">' + INST_DESC[x.id] + '</p></a></div>';
            }).join("") + SOON.map(function (x) {
                return '<div class="col-md-6 col-lg-4"><a href="' + x.page + '" class="game-card inst-card soon"><div class="d-flex justify-content-between align-items-start mb-2"><i class="fas fa-music gold inst-ico"></i><span class="inst-tag">Em breve</span></div><h5 class="fw-bold gold mb-1">' + x.n.pt + '</h5><p class="text-muted small mb-0">Afinador, escalas e exercícios, em preparação.</p></a></div>';
            }).join("");
            el.innerHTML = '<div class="row g-3">' + h + '</div>';
            el.querySelectorAll("[data-set]").forEach(function (a) {
                a.onclick = function (e) { e.preventDefault(); Inst.escolher(a.dataset.set, opt.ir ? instById(a.dataset.set).home : (opt.destino || null)); };
            });
        }
    };

    // Entradas do menu que mudam com o instrumento
    function tx(pt, en, es) { return LANG === "en" ? en : LANG === "es" ? es : pt; }
    var CHORDS_LINK = {
        violao:   ["acordes.html", t.chords, "fa-guitar"], guitarra: ["acordes.html", t.chords, "fa-guitar"],
        teclado:  ["teclado.html#acorde", t.chords, "fa-keyboard"],
        baixo:    ["baixo.html#linhas", tx("Linhas de baixo", "Bass lines (PT)", "Líneas de bajo (PT)"), "fa-wave-square"]
    };
    function itemChords() {
        var c = CHORDS_LINK[INST_ID];
        return '<li class="nav-item"><a class="nav-link" href="' + shared(c[0]) + '"><i class="fas ' + c[2] + ' me-1"></i> ' + c[1] + '</a></li>';
    }
    function itemTuner() {
        if (INST_ID === "teclado") return "";
        return '<li class="nav-item"><a class="nav-link" href="' + shared("afinador.html") + '"><i class="fas fa-sliders me-1"></i> ' + t.tuner + '</a></li>';
    }
    function itemInst() {
        var h = '<li class="nav-item dropdown"><a class="nav-link dropdown-toggle inst-toggle" href="#" id="instDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas ' + CUR.i + ' me-1"></i> ' + instName(CUR) + '</a>' +
            '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="instDropdown"><li><h6 class="dropdown-header">' + tx("Estou aprendendo", "I am learning", "Estoy aprendiendo") + '</h6></li>';
        INSTS.forEach(function (x) {
            h += '<li><a class="dropdown-item' + (x.id === INST_ID ? " fw-bold" : "") + '" href="#" data-set-inst="' + x.id + '"><i class="fas ' + x.i + ' me-2"></i> ' + instName(x) + (x.id === INST_ID ? ' <i class="fas fa-check ms-1 gold"></i>' : "") + '</a></li>';
        });
        h += '<li><hr class="dropdown-divider"></li>';
        SOON.forEach(function (x) { h += '<li><a class="dropdown-item" href="' + shared(x.page) + '"><i class="fas fa-music me-2"></i> ' + instName(x) + ' <small class="text-muted">· ' + tx("em breve", "soon", "pronto") + '</small></a></li>'; });
        if (INST_ID !== "violao") h += '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="' + shared(CUR.home) + '"><i class="fas ' + CUR.i + ' me-2"></i> ' + tx("Abrir ", "Open ", "Abrir ") + instName(CUR) + '</a></li>';
        return h + '</ul></li>';
    }
    // Menu Praticar: cada item diz para quais instrumentos serve
    var PRACTICE = [
        ["exercicios.html", "fa-hand-pointer", t.exercises, "violao,guitarra"],
        ["trocas.html", "fa-stopwatch", t.changes, "violao,guitarra"],
        ["mapa-braco.html", "fa-map", t.map, "violao,guitarra"],
        ["tecnica.html", "fa-hand", t.technique, "violao,guitarra"],
        ["teclado.html#jogo", "fa-keyboard", tx("Jogo das teclas", "Key game (PT)", "Juego de teclas (PT)"), "teclado"],
        ["teclado.html#escala", "fa-keyboard", tx("Escalas no teclado", "Keyboard scales (PT)", "Escalas en el teclado (PT)"), "teclado"],
        ["guitarra.html#escalas", "fa-bolt", tx("Escalas e caixas", "Scales and boxes (PT)", "Escalas y cajas (PT)"), "guitarra"],
        ["baixo.html#notas", "fa-wave-square", tx("Notas no braço", "Notes on the neck (PT)", "Notas en el mástil (PT)"), "baixo"],
        ["-"],
        ["jogo-imagem.html", "fa-eye", t.visualChallenge, "violao,guitarra"],
        ["jogos.html", "fa-music", t.noteId, "violao,guitarra,teclado,baixo"],
        ["jogos-braco.html", "fa-guitar", t.fretGames, "violao,guitarra"]
    ];
    function itemPractice() {
        var h = "", last = "";
        PRACTICE.forEach(function (x) {
            if (x[0] === "-") { if (last && last !== "-") { h += '<li><hr class="dropdown-divider"></li>'; last = "-"; } return; }
            if (x[3].split(",").indexOf(INST_ID) < 0) return;
            h += '<li><a class="dropdown-item" href="' + shared(x[0]) + '"><i class="fas ' + x[1] + ' me-2"></i> ' + x[2] + '</a></li>'; last = x[0];
        });
        h = h.replace(/<li><hr class="dropdown-divider"><\/li>$/, "");
        return '<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" id="praticarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-hand-pointer me-1"></i> ' + t.practice + '</a>' +
            '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="praticarDropdown">' + h + '</ul></li>';
    }

    // Páginas ainda não traduzidas: no /en/ e /es/ apontam para a raiz (PT).
    function shared(f) {
        return LANG === "pt" ? f : "../" + f;
    }
    // Páginas traduzidas: mesma pasta do idioma atual.
    function local(f) {
        return f;
    }

    // ---- Link do seletor de idioma para a página equivalente ----
    function switchTo(target) {
        var f = TRANSLATED[file] ? file : "index.html";
        if (target === "pt") return (LANG === "pt" ? f : "../" + f);
        if (LANG === "pt") return target + "/" + f;
        if (LANG === target) return f;
        return "../" + target + "/" + f;
    }

    var CH = [];
    for (var i = 1; i <= 13; i++) {
        CH.push('<li><a class="dropdown-item" href="' + local("capitulo" + i + ".html") + '">' + t.chapter + " " + i + "</a></li>");
    }

    // Grava a escolha manual para que a autodetecção não a sobreponha depois.
    var SET = function (l) { return "try{localStorage.setItem('preferredLang','" + l + "')}catch(e){}"; };

    var STORE = {
        pt: { h: "Livro e apostila", sub: "Quer ir além dos conteúdos grátis? Os materiais completos em PDF estão na Hotmart.", buy: "Ver na Hotmart",
              items: [
                { n: "Violão do Zero", d: "Apostila: seus primeiros acordes em 4 semanas.", u: "https://go.hotmart.com/A107863658L", i: "fa-guitar" },
                { n: "Tratado de Musicologia e Harmonia Tonal", d: "Livro: guia prático para teclado e violão.", u: "https://go.hotmart.com/O107863361H", i: "fa-book" } ] },
        en: { h: "Book and booklet", sub: "Want more than the free content? The complete PDFs are on Hotmart.", buy: "View on Hotmart",
              items: [
                { n: "Guitar from Zero", d: "Booklet: your first chords in 4 weeks.", u: "https://go.hotmart.com/M107864586F", i: "fa-guitar" },
                { n: "Treatise on Musicology and Tonal Harmony", d: "Book: a practical guide for keyboard and guitar.", u: "https://go.hotmart.com/E107864675W", i: "fa-book" } ] },
        es: { h: "Libro y cuadernillo", sub: "¿Quieres más que el contenido gratis? Los PDF completos están en Hotmart.", buy: "Ver en Hotmart",
              items: [
                { n: "Guitarra desde Cero", d: "Cuadernillo: tus primeros acordes en 4 semanas.", u: "https://go.hotmart.com/M107864634X", i: "fa-guitar" },
                { n: "Tratado de Musicología y Armonía Tonal", d: "Libro: guía práctica para teclado y guitarra.", u: "https://go.hotmart.com/P107864717L", i: "fa-book" } ] }
    }[LANG];

    var CATHOLIC_URL = "https://rene17bueno.github.io/musico-catolico/";
    var CATHOLIC_BTN = '<a class="catholic-btn" href="' + CATHOLIC_URL + '" target="_blank" rel="noopener"><span class="catholic-ico"><i class="fas fa-cross"></i></span><span class="catholic-txt">' + t.catholic + '<small>' + t.catholicSub + '</small></span><i class="fas fa-arrow-up-right-from-square catholic-ext"></i></a>';

    var LINKEDIN_URL = "https://www.linkedin.com/in/rene-aparecido-bueno-34030566";
    var CONTACTS =
        '<div class="mb-3 d-flex justify-content-center flex-wrap gap-3">' +
        (LINKEDIN_URL ? '<a class="footer-contact" href="' + LINKEDIN_URL + '" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin me-1"></i> LinkedIn</a>' : '') +
        '<a class="footer-contact" href="https://github.com/Rene17bueno" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github me-1"></i> GitHub</a>' +
        '<a class="footer-contact" href="https://wa.me/5544991379447" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp me-1"></i> WhatsApp</a>' +
        '<a class="footer-contact" href="mailto:renebueno17@outlook.com" aria-label="E-mail"><i class="fas fa-envelope me-1"></i> renebueno17@outlook.com</a>' +
        '</div>';

    var LANG_SWITCH =
        '<li class="nav-item d-flex align-items-center justify-content-center">' + CATHOLIC_BTN + '</li>' +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="langDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">' +
        '<i class="fas fa-globe me-1"></i> ' + LANG.toUpperCase() +
        '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="langDropdown">' +
        '<li><a class="dropdown-item" href="' + switchTo("pt") + '" onclick="' + SET("pt") + '">Português</a></li>' +
        '<li><a class="dropdown-item" href="' + switchTo("en") + '" onclick="' + SET("en") + '">English</a></li>' +
        '<li><a class="dropdown-item" href="' + switchTo("es") + '" onclick="' + SET("es") + '">Español</a></li>' +
        '</ul>' +
        '</li>';

    var NAVBAR_HTML =
        '<nav class="navbar navbar-expand-xl navbar-dark custom-navbar fixed-top">' +
        '<div class="container-fluid container-md">' +
        '<a class="navbar-brand nav-brand-title" href="' + local("index.html") + '">' + t.navBrand + '</a>' +
        '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">' +
        '<span class="navbar-toggler-icon"></span></button>' +
        '<div class="collapse navbar-collapse justify-content-end" id="navbarContent">' +
        '<ul class="navbar-nav mb-2 mb-xl-0 gap-2 text-center text-xl-start pt-3 pt-xl-0">' +
        '<li class="nav-item"><a class="nav-link" href="' + local("index.html") + '" aria-label="' + t.home + '"><i class="fas fa-home"></i><span class="nav-home-t"> ' + t.home + '</span></a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("trilha.html") + '"><i class="fas fa-route me-1"></i> ' + t.trail + '</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("aulas.html") + '"><i class="fas fa-circle-play me-1"></i> ' + t.lessons + '</a></li>' +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="capitulosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-book me-1"></i> ' + t.chapters + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="capitulosDropdown">' + CH.join("") + '</ul>' +
        '</li>' +
        itemChords() +
        itemTuner() +
        '<li class="nav-item"><a class="nav-link" href="' + shared("metronomo.html") + '"><i class="fas fa-gauge-high me-1"></i> ' + t.metro + '</a></li>' +
        itemInst() +
        itemPractice() +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="comunidadeDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-comments me-1"></i> ' + t.community + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="comunidadeDropdown">' +
        '<li><a class="dropdown-item" href="' + shared("comunidade.html") + '"><i class="fas fa-comments me-2"></i> ' + t.community + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("presenca.html") + '"><i class="fas fa-clipboard-check me-2"></i> ' + t.attendance + '</a></li>' +
        '</ul>' +
        '</li>' +
        '<li class="nav-item d-none" id="nav-admin-item"><a class="nav-link" href="' + shared("comunidade-admin.html") + '"><i class="fas fa-user-shield me-1"></i> ' + t.adminPanel + '</a></li>' +
        LANG_SWITCH +
        '</ul>' +
        '</div>' +
        '</div>' +
        '</nav>';

    var ADMIN_ALLOWED_EMAIL = "rhb7pateta@gmail.com";

    function syncAdminNavVisibility() {
        var adminItem = document.getElementById("nav-admin-item");
        if (!adminItem) return;
        var role = (localStorage.getItem("communityRole") || "").toLowerCase();
        var email = (localStorage.getItem("communityEmail") || "").toLowerCase();
        var canSeeAdmin = role === "admin" && email === ADMIN_ALLOWED_EMAIL;
        adminItem.classList.toggle("d-none", !canSeeAdmin);
    }
    window.refreshAdminNavVisibility = syncAdminNavVisibility;

    var FOOTER_HTML =
        '<footer class="site-footer py-4 mt-auto">' +
        '<div class="container text-center">' +
        '<div class="footer-brand mb-2">' + t.footBrand + '</div>' +
        CONTACTS +
        '<div class="mb-3"><a class="footer-contact" href="' + local("index.html") + '#loja"><i class="fas fa-book me-1"></i> ' + STORE.h + '</a></div>' +
        '<div class="mb-3">' + CATHOLIC_BTN + '</div>' +
        '<div class="small" style="color: #b5b0a8;">' +
        '<i class="fas fa-copyright me-1" style="color:#c9a959;"></i> 2026 &middot; Renê Aparecido Bueno &middot; Maringá &middot; PR' +
        '</div>' +
        '<div class="small mt-1" style="color:#8f8a82;font-size:.75rem">' + (LANG === 'pt' ? 'Sons dos instrumentos' : LANG === 'es' ? 'Sonidos de los instrumentos' : 'Instrument sounds') + ': FluidR3_GM (Frank Wen), <a href="https://creativecommons.org/licenses/by/3.0/us/" target="_blank" rel="noopener" style="color:inherit">CC BY 3.0</a></div>' +
        '</div>' +
        '</footer>';


    // ===== Visual compartilhado (todas as páginas): navbar sólida, polimento e responsividade =====
    var SHARED_CSS = [
        'html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}',
        'html,body{max-width:100%;overflow-x:hidden}',
        'img,svg,video,iframe{max-width:100%}',
        '::selection{background:rgba(201,169,89,.35);color:#fff}',
        ':focus-visible{outline:2px solid #c9a959;outline-offset:2px;border-radius:4px}',
        /* navbar sólida */
        '.custom-navbar{background:#0e0d1a!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-bottom:1px solid rgba(201,169,89,.28)!important;box-shadow:0 4px 18px rgba(0,0,0,.45);padding-top:.55rem;padding-bottom:.55rem;z-index:1040}',
        '@media (min-width:1200px){.custom-navbar .navbar-brand{white-space:nowrap}}','.custom-navbar .navbar-brand{white-space:normal;line-height:1.15;max-width:75%}',
        '.custom-navbar .nav-link{white-space:nowrap;border-radius:8px;padding:.5rem .7rem!important;transition:color .2s,background .2s}',
        '.inst-card{display:block;height:100%;text-decoration:none!important;color:inherit;transition:transform .15s,border-color .15s}.inst-card:hover{transform:translateY(-3px);border-color:#c9a959;color:inherit}.inst-card.sel{border-color:#c9a959;box-shadow:0 0 0 1px #c9a959 inset}.inst-card.soon{opacity:.75}.inst-ico{font-size:2.2rem}',
        '.inst-tag{display:inline-block;font-size:.72rem;font-weight:700;border-radius:999px;padding:2px 10px;background:#26233b;border:1px solid #3a3750;color:#e8d5a3}.inst-tag.ok{background:#1f3a2a;border-color:#2f6a46;color:#8fd18f}',
        '.inst-banner{background:#241f35;border:1px solid #c9a959;border-radius:14px;padding:.8rem 1rem;margin:0 0 1.2rem;color:#e8d5a3;font-size:.95rem}.inst-banner a{color:#e8d5a3;font-weight:700;margin-left:.8rem;white-space:nowrap}',
        '.custom-navbar .inst-toggle{color:#e8d5a3!important;font-weight:600}',
        '.form-range,.form-check-input{accent-color:#c9a959}.form-check-input:checked{background-color:#c9a959;border-color:#c9a959}',
        '.custom-navbar .nav-link:hover,.custom-navbar .nav-link.active{background:rgba(201,169,89,.12)}',
        '.custom-navbar .navbar-toggler{padding:.45rem .6rem;border-radius:8px;background:rgba(201,169,89,.1)}',
        '.custom-navbar .navbar-toggler:focus{box-shadow:0 0 0 2px rgba(201,169,89,.5)}',
        '.custom-navbar .dropdown-menu{background:#14131f;border:1px solid rgba(201,169,89,.28);border-radius:12px;padding:.4rem;box-shadow:0 14px 34px rgba(0,0,0,.55);max-height:70vh;overflow-y:auto}',
        '.custom-navbar .dropdown-item{border-radius:8px;padding:.5rem .8rem;white-space:normal;transition:background .2s,color .2s}',
        '.custom-navbar .dropdown-item:hover,.custom-navbar .dropdown-item.active{background:rgba(201,169,89,.16);color:#e8d5a3}',
        /* cartões e botões */
        '.game-card,.card,.accordion-item{border-radius:16px}',
        '.btn{border-radius:10px;transition:transform .15s,box-shadow .2s,background .2s,color .2s}',
        '.btn:hover{transform:translateY(-1px)}',
        '.form-select,.form-control{border-radius:10px;min-height:42px}',
        'table{max-width:100%}',
        '.site-footer{border-top:1px solid rgba(201,169,89,.2)}','.footer-contact{color:#e8d5a3;text-decoration:none;font-size:.9rem;padding:.3rem .6rem;border-radius:8px;transition:background .2s}','.footer-contact:hover{background:rgba(201,169,89,.14);color:#e8d5a3}','.store-card{display:flex;flex-direction:column;align-items:center;height:100%;padding:1rem;border:1px solid rgba(201,169,89,.3);border-radius:16px;background:#14131f;text-decoration:none!important;transition:transform .2s,border-color .2s,box-shadow .2s}','.store-card:hover{transform:translateY(-4px);border-color:#c9a959;box-shadow:0 14px 34px rgba(201,169,89,.18)}','.store-img{width:100%;max-width:240px;aspect-ratio:3/4;object-fit:cover;border-radius:8px;box-shadow:0 10px 26px rgba(0,0,0,.55)}','.store-cover{margin-bottom:1rem;width:100%;max-width:240px;aspect-ratio:3/4;border-radius:8px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:1.2rem;background:linear-gradient(160deg,#1c1b2e,#0a0a14);border:1px solid rgba(201,169,89,.45);box-shadow:inset 0 0 0 5px #0e0d1a,inset 0 0 0 6px rgba(201,169,89,.35),0 10px 26px rgba(0,0,0,.55)}','.store-cover i{color:#c9a959;font-size:1.5rem;margin-bottom:.8rem}','.store-cover b{font-family:"Playfair Display",serif;color:#e8d5a3;font-size:clamp(.85rem,3.4vw,1.15rem);line-height:1.2;letter-spacing:.3px;text-transform:uppercase}','.store-cover small{color:#b5b0a8;margin-top:.8rem;font-size:.72rem}','.catholic-btn{display:inline-flex;align-items:center;gap:.6rem;padding:.3rem .85rem .3rem .3rem;border-radius:999px;background:linear-gradient(135deg,#e8d5a3 0%,#c9a959 100%);color:#0e0d1a!important;text-decoration:none!important;font-weight:600;line-height:1.1;white-space:nowrap;box-shadow:0 0 0 1px rgba(232,213,163,.5),0 6px 18px rgba(201,169,89,.28);transition:transform .2s,box-shadow .2s}','.catholic-btn:hover{transform:translateY(-2px);box-shadow:0 0 0 1px #e8d5a3,0 10px 26px rgba(201,169,89,.45)}','.catholic-ico{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#0e0d1a;color:#e8d5a3;font-size:.8rem;flex:none}','.catholic-txt{display:flex;flex-direction:column;font-size:.85rem}','.catholic-txt small{font-weight:500;font-size:.66rem;opacity:.75;letter-spacing:.2px}','.catholic-ext{font-size:.65rem;opacity:.6}','@media (min-width:992px) and (max-width:1399.98px){.catholic-txt small{display:none}.catholic-btn{padding-right:.7rem}}','.site-footer .catholic-btn{padding:.45rem 1.2rem .45rem .45rem;gap:.8rem}','.site-footer .catholic-ico{width:42px;height:42px;font-size:1rem}','.site-footer .catholic-txt{font-size:1rem}','.site-footer .catholic-txt small{font-size:.74rem}',
        /* notebook/tablet estreito: menu cabe em uma linha */
        '@media (min-width:1200px) and (max-width:1799.98px){.custom-navbar .nav-home-t{display:none}}',
        '@media (min-width:1200px) and (max-width:1799.98px){.custom-navbar .nav-link{font-size:.8rem!important;padding:.45rem .5rem!important}.custom-navbar .navbar-nav{gap:.1rem!important}.custom-navbar .navbar-brand{font-size:1rem}.custom-navbar .container-md,.custom-navbar .container-fluid{max-width:100%}}',
        /* tablet/celular: menu recolhido rolável, alvos de toque grandes */
        '@media (max-width:1199.98px){.custom-navbar .navbar-collapse{max-height:calc(100vh - 84px);max-height:calc(100dvh - 84px);overflow-y:auto;-webkit-overflow-scrolling:touch}.custom-navbar .nav-link{padding:.7rem .9rem!important;font-size:.95rem!important}.custom-navbar .dropdown-menu{max-height:none;box-shadow:none;margin:.2rem 0 .4rem}.custom-navbar .dropdown-item{padding:.65rem .9rem}}',
        '@media (max-width:575.98px){body{padding-top:76px!important}.container,.container-fluid{padding-left:16px;padding-right:16px}.display-5{font-size:2rem}.btn{min-height:44px}}',
        '@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}'
    ].join('\n');

    function injectSharedCss() {
        var st = document.createElement("style");
        st.id = "shared-visual";
        st.textContent = SHARED_CSS;
        document.head.appendChild(st);
        // tabelas largas rolam dentro de um wrapper em vez de estourar a página
        document.querySelectorAll("table").forEach(function (tb) {
            if (tb.closest(".table-responsive,.table-scroll")) return;
            var w = document.createElement("div");
            w.className = "table-scroll";
            w.style.cssText = "overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%";
            tb.parentNode.insertBefore(w, tb);
            w.appendChild(tb);
        });
    }


    // ===== Progresso do aluno (fica só neste navegador) =====
    var PKEY = "progressoViolao";
    var Prog = {
        get: function () { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } },
        save: function (d) { try { localStorage.setItem(PKEY, JSON.stringify(d)); } catch (e) {} },
        mark: function (k, v) { var d = this.get(); d[k] = v; this.save(d); },
        add: function (k, v) { var d = this.get(); d[k] = d[k] || []; if (d[k].indexOf(v) < 0) d[k].push(v); this.save(d); },
        max: function (k, v) { var d = this.get(); d.max = d.max || {}; if (!(d.max[k] >= v)) { d.max[k] = v; this.save(d); } },
        count: function (k, ok) { var d = this.get(); d.cnt = d.cnt || {}; var c = d.cnt[k] = d.cnt[k] || [0, 0]; c[ok ? 0 : 1]++; this.save(d); }
    };
    window.Prog = Prog;
    (function () { var m = /capitulo(\d+)\.html$/.exec(location.pathname); if (m) Prog.add("caps", +m[1]); })();

    // Tela acesa nas páginas de prática (celular no apoio, violão no colo)
    function keepAwake() {
        if (!/(exercicios|trocas|afinador|metronomo|tecnica|jogos|jogo-imagem)/.test(file) || !navigator.wakeLock) return;
        var req = function () { navigator.wakeLock.request("screen").catch(function () {}); };
        req(); document.addEventListener("visibilitychange", function () { if (!document.hidden) req(); });
    }

    // PWA: instalar no celular e abrir offline
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
        var base = location.pathname.replace(/\/(en|es)\/[^\/]*$/, "/").replace(/[^\/]*$/, "");
        var mf = document.createElement("link"); mf.rel = "manifest"; mf.href = base + "manifest.json"; document.head.appendChild(mf);
        window.addEventListener("load", function () { navigator.serviceWorker.register(base + "sw.js").catch(function () {}); });
    }


    // ===== Livros e apostila (Hotmart) =====

    // x.img = caminho da capa real (ex.: "img/capa-violao-do-zero.png"); sem imagem, mostra a capa desenhada em CSS
    function storeCards() {
        return STORE.items.map(function (x) {
            var cover = x.img
                ? '<img src="' + (LANG === "pt" ? "" : "../") + x.img + '" alt="' + x.n + '" class="store-img">'
                : '<div class="store-cover"><i class="fas ' + x.i + '"></i><b>' + x.n + '</b><small>' + x.d + '</small></div>';
            return '<div class="col-6 col-md-5"><a class="store-card" href="' + x.u + '" target="_blank" rel="noopener sponsored" aria-label="' + x.n + ' - ' + STORE.buy + '">' +
                cover + '<span class="catholic-btn" style="padding:.5rem 1.1rem;margin-top:auto">' + STORE.buy + ' <i class="fas fa-arrow-up-right-from-square ms-1" style="font-size:.7rem"></i></span></a></div>';
        }).join("");
    }

    function renderStore() {
        if (file !== "index.html" && file !== "") return;
        var f = document.getElementById("site-footer");
        if (!f) return;
        f.insertAdjacentHTML("beforebegin",
            '<section id="loja" class="py-5"><div class="container"><div class="text-center mb-4"><h2 class="fw-bold" style="font-family:\'Playfair Display\',serif">' + STORE.h + '</h2>' +
            '<p class="mb-0" style="color:#b5b0a8">' + STORE.sub + '</p></div><div class="row g-3 g-md-4 justify-content-center" style="max-width:720px;margin:0 auto">' + storeCards() + '</div></div></section>');
    }

    function renderNavbar() {
        var placeholder = document.getElementById("site-navbar");
        if (placeholder) placeholder.outerHTML = NAVBAR_HTML;
        else document.body.insertAdjacentHTML("afterbegin", NAVBAR_HTML);
    }

    function renderFooter() {
        var placeholder = document.getElementById("site-footer");
        if (placeholder) placeholder.outerHTML = FOOTER_HTML;
    }

    function activateNavLinks() {
        var current = file === "" ? "index.html" : file;
        var allLinks = document.querySelectorAll(".navbar-nav .nav-link, .dropdown-menu .dropdown-item");
        allLinks.forEach(function (link) {
            var href = (link.getAttribute("href") || "").split("/").pop();
            if (href === current) {
                link.classList.add("active");
                if (link.classList.contains("dropdown-item")) {
                    var dropdown = link.closest(".dropdown");
                    if (dropdown) {
                        var toggle = dropdown.querySelector(".dropdown-toggle");
                        if (toggle) toggle.classList.add("active");
                    }
                }
            } else {
                link.classList.remove("active");
            }
        });
        if (current === "index.html") {
            var homeLink = document.querySelector('.navbar-nav .nav-link[href$="index.html"]');
            if (homeLink) homeLink.classList.add("active");
        }
    }

    function bindInst() {
        document.querySelectorAll("[data-set-inst]").forEach(function (a) {
            a.addEventListener("click", function (e) { e.preventDefault(); Inst.escolher(a.getAttribute("data-set-inst")); });
        });
    }
    // Aviso quando a página não serve ao instrumento escolhido
    function renderInstBanner() {
        if (pageOk(INST_ID) || LANG !== "pt") return;
        var nomes = pageInsts().map(function (id) { return instName(instById(id)); }).join(" e ");
        var host = document.querySelector("main .container") || document.querySelector("main");
        if (!host) return;
        var d = document.createElement("div");
        d.className = "inst-banner";
        d.innerHTML = '<i class="fas fa-circle-info me-2"></i>Esta página é para <b>' + nomes + '</b>. Você escolheu <b>' + instName(CUR) + '</b>.' +
            '<a href="' + CUR.home + '">Ir para ' + instName(CUR) + '</a><a href="#" data-close>Ver mesmo assim</a>';
        d.querySelector("[data-close]").onclick = function (e) { e.preventDefault(); d.remove(); };
        host.insertBefore(d, host.firstChild);
    }

    document.addEventListener("DOMContentLoaded", function () {
        injectSharedCss();
        keepAwake();
        document.querySelectorAll("img:not([loading])").forEach(function (im) { im.loading = "lazy"; });
        renderNavbar();
        renderStore();
        renderFooter();
        syncAdminNavVisibility();
        activateNavLinks();
        bindInst();
        renderInstBanner();
    });
})();


// Contador de visitas (carrega js/js/visitas.js em todas as páginas)
;(function(){var c=document.currentScript;if(!c||!c.src)return;var s=document.createElement('script');s.src=c.src.replace('layout.js','visitas.js');window.__ADMIN_URL=new URL('../../admin-visitas.html',c.src).href;var go=function(){document.body.appendChild(s)};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()})();
