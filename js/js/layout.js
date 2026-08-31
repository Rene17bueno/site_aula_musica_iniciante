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
            home: "Início", chapters: "Capítulos", chapter: "Capítulo",
            chords: "Acordes", games: "Jogos",
            visualChallenge: "Desafio Visual", noteId: "Identificação de Notas",
            community: "Comunidade", attendance: "Presença", adminPanel: "Painel Admin",
            navBrand: "<span>Violão</span> &middot; Iniciante",
            footBrand: "<span>Estudo de Violão</span> Iniciante"
        },
        en: {
            home: "Home", chapters: "Chapters", chapter: "Chapter",
            chords: "Chords", games: "Games",
            visualChallenge: "Visual Challenge", noteId: "Note Identification",
            community: "Community", attendance: "Attendance", adminPanel: "Admin Panel",
            navBrand: "<span>Guitar</span> &middot; Beginner",
            footBrand: "<span>Beginner</span> Guitar Study"
        },
        es: {
            home: "Inicio", chapters: "Capítulos", chapter: "Capítulo",
            chords: "Acordes", games: "Juegos",
            visualChallenge: "Desafío Visual", noteId: "Identificación de Notas",
            community: "Comunidad", attendance: "Asistencia", adminPanel: "Panel de Administración",
            navBrand: "<span>Guitarra</span> &middot; Principiante",
            footBrand: "<span>Estudio de Guitarra</span> para Principiantes"
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

    var LANG_SWITCH =
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
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="capitulosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-book me-1"></i> ' + t.chapters + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="capitulosDropdown">' + CH.join("") + '</ul>' +
        '</li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("acordes.html") + '"><i class="fas fa-guitar me-1"></i> ' + t.chords + '</a></li>' +
        '<li class="nav-item dropdown">' +
        '<a class="nav-link dropdown-toggle" href="#" id="jogosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-gamepad me-1"></i> ' + t.games + '</a>' +
        '<ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="jogosDropdown">' +
        '<li><a class="dropdown-item" href="' + shared("jogo-imagem.html") + '"><i class="fas fa-eye me-2"></i> ' + t.visualChallenge + '</a></li>' +
        '<li><a class="dropdown-item" href="' + shared("jogos.html") + '"><i class="fas fa-music me-2"></i> ' + t.noteId + '</a></li>' +
        '</ul>' +
        '</li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("comunidade.html") + '"><i class="fas fa-comments me-1"></i> ' + t.community + '</a></li>' +
        '<li class="nav-item"><a class="nav-link" href="' + shared("presenca.html") + '"><i class="fas fa-clipboard-check me-1"></i> ' + t.attendance + '</a></li>' +
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
        '<div class="small mb-3" style="color: #b5b0a8;">' +
        '<i class="fas fa-copyright me-1" style="color:#c9a959;"></i> 2026 &middot; Renê Aparecido Bueno &middot; Maringá &middot; PR' +
        '</div>' +
        '<div class="footer-social d-flex justify-content-center gap-3">' +
        '<a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>' +
        '<a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>' +
        '<a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>' +
        '<a href="#" aria-label="E-mail"><i class="fas fa-envelope"></i></a>' +
        '</div>' +
        '</div>' +
        '</footer>';

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
        renderNavbar();
        renderFooter();
        syncAdminNavVisibility();
        activateNavLinks();
    });
})();
