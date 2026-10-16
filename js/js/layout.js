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
            trail: "Comece aqui", practice: "Praticar", changes: "Trocas de acordes", tuner: "Afinador", technique: "Técnica e saúde", community: "Comunidade", attendance: "Presença", adminPanel: "Painel Admin",
            navBrand: "<span>Violão</span> &middot; Iniciante",
            footBrand: "<span>Estudo de Violão</span> Iniciante", catholic: "Músico Católico", catholicSub: "Cifras e repertórios para a missa"
        },
        en: {
            home: "Home", lessons: "Lessons (PT)", chapters: "Chapters", chapter: "Chapter",
            chords: "Chords", exercises: "Exercises (PT)", games: "Games",
            visualChallenge: "Visual Challenge", noteId: "Note Identification", fretGames: "Fretboard Games (PT)",
            trail: "Start here (PT)", practice: "Practice", changes: "Chord changes (PT)", tuner: "Tuner (PT)", technique: "Technique (PT)", community: "Community", attendance: "Attendance", adminPanel: "Admin Panel",
            navBrand: "<span>Guitar</span> &middot; Beginner",
            footBrand: "<span>Beginner</span> Guitar Study", catholic: "Catholic Musician", catholicSub: "Chord sheets for Mass (PT)"
        },
        es: {
            home: "Inicio", lessons: "Clases (PT)", chapters: "Capítulos", chapter: "Capítulo",
            chords: "Acordes", exercises: "Ejercicios (PT)", games: "Juegos",
            visualChallenge: "Desafío Visual", noteId: "Identificación de Notas", fretGames: "Juegos del Brazo (PT)",
            trail: "Empieza aquí (PT)", practice: "Practicar", changes: "Cambios de acordes (PT)", tuner: "Afinador (PT)", technique: "Técnica (PT)", community: "Comunidad", attendance: "Asistencia", adminPanel: "Panel de Administración",
            navBrand: "<span>Guitarra</span> &middot; Principiante",
            footBrand: "<span>Estudio de Guitarra</span> para Principiantes", catholic: "Músico Católico", catholicSub: "Cifras e repertórios para a missa"
        }
    };
    var t = T[LANG];

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
        '<nav class="navbar navbar-expand-lg navbar-dark custom-navbar fixed-top">' +
        '<div class="container-fluid container-md">' +
        '<a class="navbar-brand nav-brand-title" href="' + local("index.html") + '">' + t.navBrand + '</a>' +
        '<button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">' +
        '<span class="navbar-toggler-icon"></span></button>' +
        '<div class="collapse navbar-collapse justify-content-end" id="navbarContent">' +
        '<ul class="navbar-nav mb-2 mb-lg-0 gap-2 text-center text-lg-start pt-3 pt-lg-0">' +
        '<li class="nav-item"><a class="nav-link" href="' + local("index.html") + '"><i class="fas fa-home me-1"></i> ' + t.home + '</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("trilha.html") + '"><i class="fas fa-route me-1"></i> ' + t.trail + '</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("aulas.html") + '"><i class="fas fa-circle-play me-1"></i> ' + t.lessons + '</a></li>' +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="capitulosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-book me-1"></i> ' + t.chapters + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="capitulosDropdown">' + CH.join("") + '</ul>' +
        '</li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("acordes.html") + '"><i class="fas fa-guitar me-1"></i> ' + t.chords + '</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("afinador.html") + '"><i class="fas fa-sliders me-1"></i> ' + t.tuner + '</a></li>' +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="praticarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-hand-pointer me-1"></i> ' + t.practice + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="praticarDropdown">' +
        '<li><a class="dropdown-item" href="' + shared("exercicios.html") + '"><i class="fas fa-hand-pointer me-2"></i> ' + t.exercises + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("trocas.html") + '"><i class="fas fa-stopwatch me-2"></i> ' + t.changes + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("tecnica.html") + '"><i class="fas fa-hand me-2"></i> ' + t.technique + '</a></li>' +
        '<li><hr class="dropdown-divider"></li>' +
        '<li><a class="dropdown-item" href="' + shared("jogo-imagem.html") + '"><i class="fas fa-eye me-2"></i> ' + t.visualChallenge + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("jogos.html") + '"><i class="fas fa-music me-2"></i> ' + t.noteId + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("jogos-braco.html") + '"><i class="fas fa-guitar me-2"></i> ' + t.fretGames + '</a></li>' +
        '</ul>' +
        '</li>' +
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
        '@media (min-width:992px){.custom-navbar .navbar-brand{white-space:nowrap}}','.custom-navbar .navbar-brand{white-space:normal;line-height:1.15;max-width:75%}',
        '.custom-navbar .nav-link{white-space:nowrap;border-radius:8px;padding:.5rem .7rem!important;transition:color .2s,background .2s}',
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
        '@media (min-width:992px) and (max-width:1399.98px){.custom-navbar .nav-link{font-size:.8rem!important;padding:.45rem .5rem!important}.custom-navbar .navbar-nav{gap:.1rem!important}.custom-navbar .navbar-brand{font-size:1rem}.custom-navbar .container-md,.custom-navbar .container-fluid{max-width:100%}}',
        /* tablet/celular: menu recolhido rolável, alvos de toque grandes */
        '@media (max-width:991.98px){.custom-navbar .navbar-collapse{max-height:calc(100vh - 84px);max-height:calc(100dvh - 84px);overflow-y:auto;-webkit-overflow-scrolling:touch}.custom-navbar .nav-link{padding:.7rem .9rem!important;font-size:.95rem!important}.custom-navbar .dropdown-menu{max-height:none;box-shadow:none;margin:.2rem 0 .4rem}.custom-navbar .dropdown-item{padding:.65rem .9rem}}',
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
        if (!/(exercicios|trocas|afinador|tecnica|jogos|jogo-imagem)/.test(file) || !navigator.wakeLock) return;
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

    document.addEventListener("DOMContentLoaded", function () {
        injectSharedCss();
        keepAwake();
        document.querySelectorAll("img:not([loading])").forEach(function (im) { im.loading = "lazy"; });
        renderNavbar();
        renderStore();
        renderFooter();
        syncAdminNavVisibility();
        activateNavLinks();
    });
})();
