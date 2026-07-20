// ============================================================
// LAYOUT COMPARTILHADO
// Navbar, rodapé e ativação de links reutilizados em todas as
// páginas do site. Injeta o markup nos placeholders
// #site-navbar e #site-footer (ou, na ausência deles, no início
// e no fim do <body>).
// ============================================================

const NAVBAR_HTML = `
    <nav class="navbar navbar-expand-lg navbar-dark custom-navbar fixed-top">
        <div class="container-fluid container-md">
            <a class="navbar-brand nav-brand-title" href="index.html">
                <span>Tratado</span> · Musicologia
            </a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarContent">
                <ul class="navbar-nav mb-2 mb-lg-0 gap-2 text-center text-lg-start pt-3 pt-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html"><i class="fas fa-home me-1"></i> Início</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="capitulosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-book me-1"></i> Capítulos
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="capitulosDropdown">
                            <li><a class="dropdown-item" href="capitulo1.html">Capítulo 1</a></li>
                            <li><a class="dropdown-item" href="capitulo2.html">Capítulo 2</a></li>
                            <li><a class="dropdown-item" href="capitulo3.html">Capítulo 3</a></li>
                            <li><a class="dropdown-item" href="capitulo4.html">Capítulo 4</a></li>
                            <li><a class="dropdown-item" href="capitulo5.html">Capítulo 5</a></li>
                            <li><a class="dropdown-item" href="capitulo6.html">Capítulo 6</a></li>
                            <li><a class="dropdown-item" href="capitulo7.html">Capítulo 7</a></li>
                            <li><a class="dropdown-item" href="capitulo8.html">Capítulo 8</a></li>
                            <li><a class="dropdown-item" href="capitulo9.html">Capítulo 9</a></li>
                            <li><a class="dropdown-item" href="capitulo10.html">Capítulo 10</a></li>
                            <li><a class="dropdown-item" href="capitulo11.html">Capítulo 11</a></li>
                            <li><a class="dropdown-item" href="capitulo12.html">Capítulo 12</a></li>
                            <li><a class="dropdown-item" href="capitulo13.html">Capítulo 13</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="acordes.html"><i class="fas fa-guitar me-1"></i> Acordes</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="jogosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-gamepad me-1"></i> Jogos
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="jogosDropdown">
                            <li>
                                <a class="dropdown-item" href="jogo-imagem.html">
                                    <i class="fas fa-eye me-2"></i> Desafio Visual
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="jogos.html">
                                    <i class="fas fa-music me-2"></i> Identificação de Notas
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="apendice.html"><i class="fas fa-table me-1"></i> Apêndice</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>`;

const FOOTER_HTML = `
    <footer class="site-footer py-4 mt-auto">
        <div class="container text-center">
            <div class="footer-brand mb-2"><span>Tratado</span> · Musicologia</div>
            <div class="small mb-3" style="color: #b5b0a8;">
                <i class="fas fa-copyright me-1" style="color:#c9a959;"></i>
                2026 · Renê Aparecido Bueno · Maringá · PR
            </div>
            <div class="footer-social d-flex justify-content-center gap-3">
                <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="#" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
                <a href="#" aria-label="E-mail"><i class="fas fa-envelope"></i></a>
            </div>
        </div>
    </footer>`;

function renderNavbar() {
    const placeholder = document.getElementById('site-navbar');
    if (placeholder) {
        placeholder.outerHTML = NAVBAR_HTML;
    } else {
        document.body.insertAdjacentHTML('afterbegin', NAVBAR_HTML);
    }
}

function renderFooter() {
    const placeholder = document.getElementById('site-footer');
    if (placeholder) {
        placeholder.outerHTML = FOOTER_HTML;
    }
}

function activateNavLinks() {
    const fileName = window.location.pathname.split('/').pop() || 'index.html';
    const currentPage = fileName === '' ? 'index.html' : fileName;
    const allLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-menu .dropdown-item');

    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || href === './' + currentPage) {
            link.classList.add('active');
            if (link.classList.contains('dropdown-item')) {
                const dropdown = link.closest('.dropdown');
                if (dropdown) {
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.classList.add('active');
                    }
                }
            }
        } else {
            link.classList.remove('active');
        }
    });

    if (currentPage === 'index.html' || currentPage === '') {
        const homeLink = document.querySelector('.navbar-nav .nav-link[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderNavbar();
    renderFooter();
    activateNavLinks();
});
