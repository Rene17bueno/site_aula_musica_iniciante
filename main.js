// ============================================================
// SISTEMA UNIFICADO DE ACORDES E ESCALAS
// ============================================================

const NOTAS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const AFINACAO = ["E", "B", "G", "D", "A", "E"];

// ============================================================
// 1. ACORDES - BIBLIOTECA
// ============================================================

const ACORDES_BIBLIOTECA = {};

function shape(baseFret, dots, status, barre = null, nome = '') {
    return { baseFret, dots, status, barre, nome };
}

// Maior
ACORDES_BIBLIOTECA["Maior"] = {
    "C": [shape(1, [[2,3,3,"C"],[3,2,2,"E"],[5,1,1,"C"]], ["x","o","o","o","o","o"], null, "aberto")],
    "D": [shape(1, [[4,2,1,"D"],[5,3,3,"A"],[6,2,2,"F#"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[2,2,2,"B"],[3,2,3,"E"],[4,1,1,"G#"]], ["o","o","o","o","o","o"], null, "aberto")],
    "F": [shape(1, [[2,3,3,"C"],[3,3,4,"F"],[4,2,2,"A"]], ["o","o","o","o","o","o"], {fret:1,from:1,to:6}, "barre")],
    "G": [shape(1, [[1,3,2,"G"],[2,2,1,"B"],[6,3,3,"G"]], ["o","o","o","o","o","o"], null, "aberto")],
    "A": [shape(1, [[3,2,1,"E"],[4,2,2,"A"],[5,2,3,"C#"]], ["x","o","o","o","o","o"], null, "aberto")],
    "B": [shape(2, [[3,3,2,"F#"],[4,3,3,"B"],[5,3,4,"D#"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")]
};

// Menor
ACORDES_BIBLIOTECA["Menor"] = {
    "C": [shape(3, [[3,3,3,"G"],[4,3,4,"C"],[5,2,2,"D#"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")],
    "D": [shape(1, [[4,2,2,"D"],[5,3,3,"A"],[6,1,1,"F"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[2,2,2,"B"],[3,2,3,"E"]], ["o","o","o","o","o","o"], null, "aberto")],
    "F": [shape(1, [[2,3,3,"C"],[3,3,4,"F"],[4,1,1,"G#"]], ["o","o","o","o","o","o"], {fret:1,from:1,to:6}, "barre")],
    "G": [shape(3, [[2,3,3,"D"],[3,3,4,"G"],[4,1,1,"A#"]], ["o","o","o","o","o","o"], {fret:1,from:1,to:6}, "barre")],
    "A": [shape(1, [[3,2,2,"E"],[4,2,3,"A"],[5,1,1,"C"]], ["x","o","o","o","o","o"], null, "aberto")],
    "B": [shape(2, [[3,3,3,"F#"],[4,3,4,"B"],[5,2,2,"D"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")]
};

// Sétima
ACORDES_BIBLIOTECA["Sétima (7)"] = {
    "C": [shape(1, [[2,3,3,"C"],[3,2,2,"E"],[4,3,4,"A#"],[5,1,1,"C"]], ["x","o","o","o","o","o"], null, "aberto")],
    "D": [shape(1, [[4,2,1,"D"],[5,1,2,"C"],[6,2,3,"F#"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[2,2,2,"B"],[4,1,1,"G#"]], ["o","o","o","o","o","o"], null, "aberto")],
    "G": [shape(1, [[1,3,3,"G"],[2,2,2,"B"],[6,1,1,"F"]], ["o","o","o","o","o","o"], null, "aberto")],
    "A": [shape(1, [[3,2,1,"E"],[5,2,2,"G"]], ["x","o","o","o","o","o"], null, "aberto")],
    "B": [shape(2, [[3,3,3,"F#"],[5,3,4,"E"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")]
};

// Sétima Maior
ACORDES_BIBLIOTECA["Sétima Maior (7M)"] = {
    "C": [shape(1, [[2,3,3,"C"],[3,2,2,"E"]], ["x","o","o","o","o","o"], null, "aberto")],
    "D": [shape(1, [[4,2,1,"D"],[5,2,1,"C#"],[6,2,1,"F#"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[2,2,2,"B"],[3,1,1,"D#"],[4,1,1,"G#"]], ["o","o","o","o","o","o"], null, "aberto")],
    "G": [shape(1, [[1,3,2,"G"],[6,2,1,"F#"]], ["o","x","o","o","o","o"], null, "aberto")],
    "A": [shape(1, [[3,2,1,"E"],[4,1,2,"G#"],[5,2,3,"C#"]], ["x","o","o","o","o","o"], null, "aberto")],
    "B": [shape(2, [[3,3,3,"F#"],[4,2,2,"B"],[5,1,1,"A#"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")]
};

// Suspenso
ACORDES_BIBLIOTECA["Suspenso 4 (sus4)"] = {
    "C": [shape(1, [[2,3,3,"C"],[3,3,4,"F"],[5,1,1,"C"]], ["x","o","o","o","o","o"], null, "aberto")],
    "D": [shape(1, [[4,2,1,"D"],[5,3,2,"A"],[6,3,3,"G"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[2,2,2,"B"],[3,2,3,"E"],[4,2,4,"A"]], ["o","o","o","o","o","o"], null, "aberto")],
    "G": [shape(1, [[1,3,3,"G"],[2,3,4,"C"],[6,3,2,"G"]], ["o","o","o","o","o","o"], null, "aberto")],
    "A": [shape(1, [[3,2,1,"E"],[4,2,2,"A"],[5,3,3,"D"]], ["x","o","o","o","o","o"], null, "aberto")],
    "B": [shape(2, [[3,4,3,"F#"],[4,4,4,"B"],[5,3,2,"E"]], ["x","o","o","o","o","o"], {fret:1,from:2,to:6}, "barre")]
};

// Diminuto
ACORDES_BIBLIOTECA["Diminuto (m♭5)"] = {
    "C": [shape(1, [[4,1,1,"D#"],[5,4,4,"C"],[6,2,2,"F#"]], ["x","x","o","o","o","x"], null, "aberto")],
    "D": [shape(1, [[4,0,0,"D"],[5,1,1,"G#"],[6,1,2,"F"]], ["x","x","o","o","o","o"], null, "aberto")],
    "E": [shape(1, [[3,3,3,"A#"],[4,2,2,"E"],[5,2,1,"G"]], ["x","x","o","o","o","x"], null, "aberto")],
    "G": [shape(1, [[4,0,0,"G"],[5,2,1,"C#"],[6,3,2,"A#"]], ["x","x","o","o","o","o"], null, "aberto")],
    "A": [shape(1, [[3,2,2,"D#"],[4,2,3,"A"],[5,1,1,"C"]], ["x","o","o","o","o","x"], null, "aberto")],
    "B": [shape(1, [[2,2,2,"B"],[4,3,4,"F"],[5,1,1,"D"]], ["x","o","x","o","o","x"], null, "aberto")]
};

// ============================================================
// 2. ESCALAS - FÓRMULAS
// ============================================================

const ESCALAS_FORMULAS = {
    "Maior Natural": [0,2,4,5,7,9,11],
    "Menor Natural": [0,2,3,5,7,8,10],
    "Menor Harmônica": [0,2,3,5,7,8,11],
    "Menor Melódica": [0,2,3,5,7,9,11],
    "Pentatônica Maior": [0,2,4,7,9],
    "Pentatônica Menor": [0,3,5,7,10],
    "Jônio": [0,2,4,5,7,9,11],
    "Dórico": [0,2,3,5,7,9,10],
    "Frígio": [0,1,3,5,7,8,10],
    "Lídio": [0,2,4,6,7,9,11],
    "Mixolídio": [0,2,4,5,7,9,10],
    "Eólio": [0,2,3,5,7,8,10],
    "Lócrio": [0,1,3,5,6,8,10],
    "Cigana Húngara": [0,2,3,6,7,8,11],
    "Árabe Dominante": [0,1,4,5,7,8,10],
    "Húngara Maior": [0,3,4,6,7,9,10],
    "Blues": [0,3,5,6,7,10],
    "Tons Inteiros": [0,2,4,6,8,10],
    "Diminuta (Octatônica)": [0,2,3,5,6,8,9,11],
    "Bebop Maior": [0,2,4,5,7,8,9,11]
};

// ============================================================
// 3. GERADORES SVG
// ============================================================

function gerarSvgAcorde(tonica, chord, largura = 480, altura = 190) {
    const margemEsquerda = 50, margemSuperior = 32;
    const espCordas = 26, espCasas = 68;
    const numCasas = 9;

    let svg = `<svg width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="#121212" rx="6"/>`;

    const peso = (chord.baseFret === 1) ? 4 : 1.8;
    svg += `<line x1="${margemEsquerda}" y1="${margemSuperior}" x2="${margemEsquerda}" y2="${margemSuperior + (espCordas*5)}" stroke="#888" stroke-width="${peso}" stroke-linecap="round"/>`;

    for (let i=1; i<=numCasas; i++) {
        let x = margemEsquerda + i*espCasas;
        let casaReal = chord.baseFret + i - 1;
        svg += `<line x1="${x}" y1="${margemSuperior}" x2="${x}" y2="${margemSuperior + (espCordas*5)}" stroke="#3a3a3a" stroke-width="1.5"/>`;
        svg += `<text x="${x - espCasas/2}" y="${margemSuperior - 12}" font-family="'Inter',Arial" font-size="9" fill="#666" text-anchor="middle">${casaReal}</text>`;
    }

    for (let c=0; c<6; c++) {
        let y = margemSuperior + c*espCordas;
        svg += `<line x1="${margemEsquerda}" y1="${y}" x2="${margemEsquerda + numCasas*espCasas}" y2="${y}" stroke="#4a4a4a" stroke-width="1.2"/>`;
        svg += `<text x="${margemEsquerda-20}" y="${y+5}" font-family="'Inter',Arial" font-size="10" font-weight="600" fill="#888" text-anchor="middle">${AFINACAO[c]}</text>`;
    }

    if (chord.barre) {
        let b = chord.barre;
        let xPos = margemEsquerda + b.fret*espCasas - espCasas/2;
        let yIni = margemSuperior + (b.from-1)*espCordas;
        let yFim = margemSuperior + (b.to-1)*espCordas;
        svg += `<rect x="${xPos-5}" y="${yIni-3}" width="10" height="${yFim-yIni+6}" rx="4" fill="#e0e0e0" opacity="0.7"/>`;
    }

    chord.dots.forEach(d => {
        let cordaIdx = d[0]-1, casaIdx = d[1], dedo = d[2], nota = d[3]||'';
        let cx = margemEsquerda + casaIdx*espCasas - espCasas/2;
        let cy = margemSuperior + cordaIdx*espCordas;
        let isTonica = (nota === tonica);
        let cor = isTonica ? '#c9a959' : '#f0f0f0';
        let textoCor = isTonica ? '#0a0a0a' : '#0a0a0a';
        svg += `<circle cx="${cx}" cy="${cy}" r="8" fill="${cor}" stroke="${isTonica ? '#c9a959' : '#555'}" stroke-width="0.8"/>`;
        svg += `<text x="${cx}" y="${cy+3}" font-family="'Inter',Arial" font-size="8" font-weight="700" fill="${textoCor}" text-anchor="middle">${dedo}</text>`;
    });

    if (chord.status) {
        chord.status.forEach((st,i) => {
            if (st === 'x' || st === 'o') {
                let y = margemSuperior + i*espCordas + 4;
                let cor = st==='x' ? '#ff5555' : '#66d966';
                svg += `<text x="${margemEsquerda + numCasas*espCasas + 16}" y="${y+5}" font-family="'Inter',Arial" font-size="13" font-weight="700" fill="${cor}" text-anchor="middle">${st.toUpperCase()}</text>`;
            }
        });
    }

    svg += `</svg>`;
    return svg;
}

function gerarSvgEscala(tonica, notasDaEscala, largura = 480, altura = 190) {
    const margemEsquerda = 50, margemSuperior = 32;
    const espCordas = 26, espCasas = 68;
    const numCasas = 5;

    let svg = `<svg width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="#121212" rx="6"/>`;

    svg += `<line x1="${margemEsquerda}" y1="${margemSuperior}" x2="${margemEsquerda}" y2="${margemSuperior + (espCordas*5)}" stroke="#888" stroke-width="4" stroke-linecap="round"/>`;

    for (let i=1; i<=numCasas; i++) {
        let x = margemEsquerda + i*espCasas;
        svg += `<line x1="${x}" y1="${margemSuperior}" x2="${x}" y2="${margemSuperior + (espCordas*5)}" stroke="#3a3a3a" stroke-width="1.5"/>`;
        svg += `<text x="${x - espCasas/2}" y="${margemSuperior - 12}" font-family="'Inter',Arial" font-size="9" fill="#666" text-anchor="middle">${i}ª</text>`;
    }

    for (let c=0; c<6; c++) {
        let y = margemSuperior + c*espCordas;
        svg += `<line x1="${margemEsquerda}" y1="${y}" x2="${margemEsquerda + numCasas*espCasas}" y2="${y}" stroke="#4a4a4a" stroke-width="1.2"/>`;
        svg += `<text x="${margemEsquerda-20}" y="${y+5}" font-family="'Inter',Arial" font-size="10" font-weight="600" fill="#888" text-anchor="middle">${AFINACAO[c]}</text>`;
    }

    for (let c=0; c<6; c++) {
        let idxBase = NOTAS.indexOf(AFINACAO[c]);
        for (let casa=0; casa<=numCasas; casa++) {
            let idxNota = (idxBase + casa) % 12;
            let notaAtual = NOTAS[idxNota];
            if (notasDaEscala.includes(notaAtual)) {
                let cx = margemEsquerda + casa*espCasas - (casa===0 ? 0 : espCasas/2);
                let cy = margemSuperior + c*espCordas;
                let isTonica = (notaAtual === tonica);
                let cor = isTonica ? '#c9a959' : '#f0f0f0';
                let textoCor = isTonica ? '#0a0a0a' : '#0a0a0a';
                let raio = (casa===0) ? 7 : 9;
                svg += `<circle cx="${cx}" cy="${cy}" r="${raio}" fill="${cor}" stroke="${isTonica ? '#c9a959' : '#555'}" stroke-width="0.8"/>`;
                svg += `<text x="${cx}" y="${cy+3}" font-family="'Inter',Arial" font-size="7" font-weight="700" fill="${textoCor}" text-anchor="middle">${notaAtual}</text>`;
            }
        }
    }

    svg += `</svg>`;
    return svg;
}

// ============================================================
// 4. MONTAGEM DOS ITENS
// ============================================================

const items = [];

// Acordes
for (let [tipo, mapa] of Object.entries(ACORDES_BIBLIOTECA)) {
    for (let [tonica, formas] of Object.entries(mapa)) {
        formas.forEach((f, idx) => {
            let nome = `${tonica} ${tipo}`;
            let badge = tipo;
            let cat = 'triade';
            if (tipo.includes('Sétima') || tipo.includes('7')) cat = 'tetrade';
            if (tipo.includes('Dominante')) cat = 'dominante';
            if (tipo.includes('Diminuto')) cat = 'diminuto';
            if (tipo.includes('Suspenso')) cat = 'suspenso';

            let notas = f.dots.map(d => d[3] || '').filter(Boolean);
            let notasStr = notas.join(' · ');
            let svg = gerarSvgAcorde(tonica, f);

            items.push({
                tipo: 'acorde',
                nome: nome,
                badge: badge,
                categoria: cat,
                notas: notasStr,
                svg: svg,
                tonica: tonica,
                tituloModal: nome,
                badgeModal: badge
            });
        });
    }
}

// Escalas
for (let [nomeEscala, formula] of Object.entries(ESCALAS_FORMULAS)) {
    NOTAS.forEach(tonica => {
        let idxT = NOTAS.indexOf(tonica);
        let notas = formula.map(intervalo => NOTAS[(idxT + intervalo) % 12]);
        let notasUnicas = [...new Set(notas)];
        let cat = 'modo';
        if (nomeEscala.includes('Cigana') || nomeEscala.includes('Árabe') || nomeEscala.includes('Húngara')) cat = 'exotica';
        if (nomeEscala.includes('Blues') || nomeEscala.includes('Tons') || nomeEscala.includes('Diminuta') || nomeEscala.includes('Bebop')) cat = 'exotica';
        if (nomeEscala.includes('Pentatônica')) cat = 'triade';

        let svg = gerarSvgEscala(tonica, notasUnicas);
        items.push({
            tipo: 'escala',
            nome: `${tonica} ${nomeEscala}`,
            badge: nomeEscala,
            categoria: cat,
            notas: notasUnicas.join(' · '),
            svg: svg,
            tonica: tonica,
            tituloModal: `${tonica} · ${nomeEscala}`,
            badgeModal: 'Escala'
        });
    });
}

// ============================================================
// 5. RENDERIZAÇÃO
// ============================================================

const container = document.getElementById('galleryContainer');
const visibleSpan = document.getElementById('visibleCount');
const totalSpan = document.getElementById('totalCount');
let currentFilter = 'all';
let currentView = 'acorde';

function render(filter = 'all', view = currentView) {
    let filtered = items;

    if (view === 'acorde') {
        filtered = filtered.filter(it => it.tipo === 'acorde');
    } else if (view === 'escala') {
        filtered = filtered.filter(it => it.tipo === 'escala');
    }

    if (filter !== 'all') {
        filtered = filtered.filter(it => it.categoria === filter);
    }

    visibleSpan.textContent = filtered.length;
    totalSpan.textContent = items.length;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-4 text-muted"><i class="fas fa-search fa-2x mb-2 d-block"></i>Nenhum item encontrado.</div>`;
        return;
    }

    let html = '';
    filtered.forEach((item, idx) => {
        html += `
            <div class="col-6 col-md-4 col-lg-3">
                <div class="card-chord" data-index="${idx}" data-bs-toggle="modal" data-bs-target="#modalDetalhe">
                    <div class="svg-wrapper">${item.svg}</div>
                    <div class="chord-name">${item.nome}</div>
                    <div class="chord-notes">${item.notas}</div>
                    <span class="chord-badge">${item.badge}</span>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    window._modalItems = filtered;
}

// ============================================================
// 6. EVENTOS
// ============================================================

// Filtros
document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        render(currentFilter, currentView);
    });
});

// Toggle
document.getElementById('btnViewAcorde').addEventListener('click', function() {
    document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentView = 'acorde';
    render(currentFilter, currentView);
});
document.getElementById('btnViewEscala').addEventListener('click', function() {
    document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentView = 'escala';
    render(currentFilter, currentView);
});
document.getElementById('btnViewTodos').addEventListener('click', function() {
    document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    currentView = 'todos';
    render(currentFilter, currentView);
});

// Modal
const modal = document.getElementById('modalDetalhe');
modal.addEventListener('show.bs.modal', function(e) {
    const card = e.relatedTarget;
    const idx = parseInt(card.dataset.index);
    const itemsList = window._modalItems || [];
    const item = itemsList[idx];
    if (!item) return;

    document.getElementById('modalSvgContainer').innerHTML = item.svg;
    document.getElementById('modalTitle').textContent = item.tituloModal || item.nome;
    document.getElementById('modalBadge').textContent = item.badgeModal || item.badge;
    document.getElementById('modalNotes').textContent = item.notas || '';
});

// ============================================================
// 7. INICIALIZA
// ============================================================

document.getElementById('btnViewAcorde').classList.add('active');
render('all', 'acorde');

console.log(`✅ Dicionário carregado: ${items.length} itens (${items.filter(i=>i.tipo==='acorde').length} acordes, ${items.filter(i=>i.tipo==='escala').length} escalas)`);

// ============================================================
// 8. FUNÇÕES LEGADAS (para compatibilidade)
// ============================================================

function createTable(elementId, headers, rows, caption) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let html = `<div class="table-wrap"><table><thead><tr>`;
    headers.forEach(h => html += `<th>${h}</th>`);
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => html += `<td>${cell}</td>`);
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    if (caption) {
        html += `<div class="table-caption"><i class="fas fa-book-open"></i> ${caption}</div>`;
    }
    html += `</div>`;
    el.innerHTML = html;
}

window.createTable = createTable;
window.ACORDES_BIBLIOTECA = ACORDES_BIBLIOTECA;
window.ESCALAS_FORMULAS = ESCALAS_FORMULAS;
window.items = items;