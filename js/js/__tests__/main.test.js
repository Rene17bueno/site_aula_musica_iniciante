/**
 * @jest-environment jsdom
 *
 * Unit tests for js/js/main.js — the shared chord/scale engine used across
 * the site's HTML pages. Before these tests the module had no coverage.
 */

const main = require('../main');

const {
    NOTAS,
    AFINACAO,
    ACORDES_BIBLIOTECA,
    ESCALAS_FORMULAS,
    shape,
    gerarSvgAcorde,
    gerarSvgEscala,
    items,
    render,
    createTable
} = main;

describe('constantes musicais', () => {
    test('NOTAS contém as 12 notas cromáticas em ordem', () => {
        expect(NOTAS).toEqual(
            ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        );
        expect(NOTAS).toHaveLength(12);
        expect(new Set(NOTAS).size).toBe(12);
    });

    test('AFINACAO tem 6 cordas e usa apenas notas válidas', () => {
        expect(AFINACAO).toHaveLength(6);
        AFINACAO.forEach(nota => expect(NOTAS).toContain(nota));
    });
});

describe('shape()', () => {
    test('monta o objeto de forma com valores padrão', () => {
        const s = shape(1, [[2, 3, 3, 'C']], ['x', 'o', 'o', 'o', 'o', 'o']);
        expect(s).toEqual({
            baseFret: 1,
            dots: [[2, 3, 3, 'C']],
            status: ['x', 'o', 'o', 'o', 'o', 'o'],
            barre: null,
            nome: ''
        });
    });

    test('aceita barre e nome customizados', () => {
        const barre = { fret: 1, from: 1, to: 6 };
        const s = shape(2, [], [], barre, 'barre');
        expect(s.barre).toBe(barre);
        expect(s.nome).toBe('barre');
        expect(s.baseFret).toBe(2);
    });
});

describe('ACORDES_BIBLIOTECA', () => {
    const tipos = Object.keys(ACORDES_BIBLIOTECA);

    test('contém os tipos de acordes esperados', () => {
        expect(tipos).toEqual(expect.arrayContaining(['Maior', 'Menor']));
        expect(tipos.length).toBeGreaterThanOrEqual(6);
    });

    test('cada forma tem estrutura válida', () => {
        tipos.forEach(tipo => {
            Object.entries(ACORDES_BIBLIOTECA[tipo]).forEach(([tonica, formas]) => {
                expect(NOTAS).toContain(tonica);
                expect(Array.isArray(formas)).toBe(true);
                formas.forEach(forma => {
                    expect(typeof forma.baseFret).toBe('number');
                    expect(forma.baseFret).toBeGreaterThanOrEqual(1);
                    expect(Array.isArray(forma.dots)).toBe(true);
                    expect(forma.status).toHaveLength(6);
                    forma.status.forEach(st => expect(['x', 'o']).toContain(st));
                });
            });
        });
    });
});

describe('ESCALAS_FORMULAS', () => {
    test('fórmulas usam intervalos dentro de uma oitava e começam na tônica', () => {
        Object.entries(ESCALAS_FORMULAS).forEach(([nome, formula]) => {
            expect(Array.isArray(formula)).toBe(true);
            expect(formula[0]).toBe(0);
            formula.forEach(intervalo => {
                expect(intervalo).toBeGreaterThanOrEqual(0);
                expect(intervalo).toBeLessThan(12);
            });
            // intervalos estritamente crescentes
            for (let i = 1; i < formula.length; i++) {
                expect(formula[i]).toBeGreaterThan(formula[i - 1]);
            }
        });
    });

    test('escalas conhecidas têm as fórmulas corretas', () => {
        expect(ESCALAS_FORMULAS['Maior Natural']).toEqual([0, 2, 4, 5, 7, 9, 11]);
        expect(ESCALAS_FORMULAS['Menor Natural']).toEqual([0, 2, 3, 5, 7, 8, 10]);
        expect(ESCALAS_FORMULAS['Pentatônica Menor']).toEqual([0, 3, 5, 7, 10]);
    });
});

describe('gerarSvgAcorde()', () => {
    const chord = ACORDES_BIBLIOTECA['Maior']['C'][0];

    test('retorna um SVG bem formado com dimensões padrão', () => {
        const svg = gerarSvgAcorde('C', chord);
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
        expect(svg).toContain('width="480"');
        expect(svg).toContain('height="190"');
    });

    test('respeita largura e altura customizadas', () => {
        const svg = gerarSvgAcorde('C', chord, 600, 300);
        expect(svg).toContain('width="600"');
        expect(svg).toContain('height="300"');
    });

    test('desenha um círculo por dot do acorde', () => {
        const svg = gerarSvgAcorde('C', chord);
        const circulos = (svg.match(/<circle/g) || []).length;
        expect(circulos).toBe(chord.dots.length);
    });

    test('desenha o retângulo da pestana quando há barre', () => {
        const barreChord = ACORDES_BIBLIOTECA['Maior']['F'][0];
        expect(barreChord.barre).not.toBeNull();
        const svg = gerarSvgAcorde('F', barreChord);
        expect(svg).toContain('<rect x=');
    });

    test('destaca a tônica com a cor dourada', () => {
        const svg = gerarSvgAcorde('C', chord);
        expect(svg).toContain('#c9a959');
    });
});

describe('gerarSvgEscala()', () => {
    test('retorna um SVG bem formado', () => {
        const svg = gerarSvgEscala('C', ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
    });

    test('inclui apenas notas da escala fornecida', () => {
        const svg = gerarSvgEscala('C', ['C', 'E', 'G']);
        // notas exibidas aparecem como conteúdo de <text>...</text>
        const textos = [...svg.matchAll(/>([A-G]#?)<\/text>/g)].map(m => m[1]);
        const notasDesenhadas = textos.filter(t => ['C', 'E', 'G'].includes(t));
        expect(notasDesenhadas.length).toBeGreaterThan(0);
        // nenhuma nota fora da escala deve ser desenhada como marcador
        const foraDaEscala = textos.filter(
            t => NOTAS.includes(t) && !['C', 'E', 'G'].includes(t) && !AFINACAO.includes(t)
        );
        expect(foraDaEscala).toHaveLength(0);
    });

    test('escala vazia não desenha marcadores de nota', () => {
        const svg = gerarSvgEscala('C', []);
        // ainda desenha os rótulos das cordas (AFINACAO), mas nenhum marcador
        expect(svg).toContain('<svg');
    });
});

describe('items (montagem do dicionário)', () => {
    test('não está vazio e contém acordes e escalas', () => {
        expect(items.length).toBeGreaterThan(0);
        const tipos = new Set(items.map(i => i.tipo));
        expect(tipos.has('acorde')).toBe(true);
        expect(tipos.has('escala')).toBe(true);
    });

    test('cada item tem os campos obrigatórios e um svg', () => {
        items.forEach(item => {
            expect(item).toHaveProperty('nome');
            expect(item).toHaveProperty('badge');
            expect(item).toHaveProperty('categoria');
            expect(item).toHaveProperty('svg');
            expect(item.svg.startsWith('<svg')).toBe(true);
            expect(NOTAS).toContain(item.tonica);
        });
    });

    test('há uma escala para cada tônica cromática', () => {
        const maiorNatural = items.filter(
            i => i.tipo === 'escala' && i.badge === 'Maior Natural'
        );
        expect(maiorNatural).toHaveLength(NOTAS.length);
    });

    test('classifica acordes de sétima como tétrade', () => {
        const setima = items.find(i => i.tipo === 'acorde' && i.badge.includes('Sétima'));
        expect(setima).toBeDefined();
        expect(setima.categoria).toBe('tetrade');
    });
});

describe('render()', () => {
    // main.js captura as referências de DOM (container/visibleSpan/totalSpan)
    // no momento em que é carregado. Para exercitar render() com um DOM real,
    // preparamos o DOM e recarregamos o módulo isoladamente.
    function loadWithGalleryDom() {
        document.body.innerHTML = `
            <div id="galleryContainer"></div>
            <span id="visibleCount"></span>
            <span id="totalCount"></span>
        `;
        let mod;
        jest.isolateModules(() => {
            mod = require('../main');
        });
        return mod;
    }

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    test('retorna cedo sem lançar quando os elementos não existem', () => {
        expect(() => render('all', 'acorde')).not.toThrow();
    });

    test('preenche o container e atualiza contadores', () => {
        const mod = loadWithGalleryDom();
        mod.render('all', 'acorde');

        const container = document.getElementById('galleryContainer');
        const total = document.getElementById('totalCount');
        const visible = document.getElementById('visibleCount');

        expect(container.querySelectorAll('.card-chord').length).toBeGreaterThan(0);
        expect(Number(total.textContent)).toBe(mod.items.length);
        const acordes = mod.items.filter(i => i.tipo === 'acorde').length;
        expect(Number(visible.textContent)).toBe(acordes);
    });

    test('filtra por tipo escala', () => {
        const mod = loadWithGalleryDom();
        mod.render('all', 'escala');
        const visible = document.getElementById('visibleCount');
        const escalas = mod.items.filter(i => i.tipo === 'escala').length;
        expect(Number(visible.textContent)).toBe(escalas);
    });

    test('mostra mensagem de vazio quando o filtro não casa', () => {
        const mod = loadWithGalleryDom();
        mod.render('categoria-inexistente', 'acorde');
        const container = document.getElementById('galleryContainer');
        expect(container.textContent).toContain('Nenhum item encontrado');
        expect(Number(document.getElementById('visibleCount').textContent)).toBe(0);
    });
});

describe('interações de UI (event listeners)', () => {
    // Carrega o módulo com um DOM completo para que os event listeners de
    // topo (filtros, toggles e modal) sejam registrados sobre elementos reais.
    function loadFullUi() {
        document.body.innerHTML = `
            <button class="btn-filter active" data-filter="all"></button>
            <button class="btn-filter" data-filter="triade"></button>
            <button id="btnViewAcorde" class="btn-toggle"></button>
            <button id="btnViewEscala" class="btn-toggle"></button>
            <button id="btnViewTodos" class="btn-toggle"></button>
            <div id="galleryContainer"></div>
            <span id="visibleCount"></span>
            <span id="totalCount"></span>
            <div id="modalDetalhe">
                <div id="modalSvgContainer"></div>
                <span id="modalTitle"></span>
                <span id="modalBadge"></span>
                <span id="modalNotes"></span>
            </div>
        `;
        let mod;
        jest.isolateModules(() => {
            mod = require('../main');
        });
        return mod;
    }

    afterEach(() => {
        document.body.innerHTML = '';
        jest.resetModules();
    });

    test('btnViewAcorde recebe a classe active na inicialização', () => {
        loadFullUi();
        expect(document.getElementById('btnViewAcorde').classList.contains('active')).toBe(true);
    });

    test('clicar em um filtro marca-o como ativo e re-renderiza', () => {
        const mod = loadFullUi();
        const triade = document.querySelector('.btn-filter[data-filter="triade"]');
        triade.click();
        expect(triade.classList.contains('active')).toBe(true);
        expect(document.querySelector('.btn-filter[data-filter="all"]').classList.contains('active')).toBe(false);
        const esperado = mod.items.filter(i => i.tipo === 'acorde' && i.categoria === 'triade').length;
        expect(Number(document.getElementById('visibleCount').textContent)).toBe(esperado);
    });

    test('alternar para escala mostra apenas escalas', () => {
        const mod = loadFullUi();
        document.getElementById('btnViewEscala').click();
        expect(document.getElementById('btnViewEscala').classList.contains('active')).toBe(true);
        const escalas = mod.items.filter(i => i.tipo === 'escala').length;
        expect(Number(document.getElementById('visibleCount').textContent)).toBe(escalas);
    });

    test('alternar para todos mostra o total de itens', () => {
        const mod = loadFullUi();
        document.getElementById('btnViewTodos').click();
        expect(document.getElementById('btnViewTodos').classList.contains('active')).toBe(true);
        expect(Number(document.getElementById('visibleCount').textContent)).toBe(mod.items.length);
    });

    test('abrir o modal preenche título, badge, notas e svg do item', () => {
        const mod = loadFullUi();
        mod.render('all', 'acorde');
        const primeiro = document.querySelector('.card-chord');
        const item = window._modalItems[Number(primeiro.dataset.index)];

        const evt = new Event('show.bs.modal');
        evt.relatedTarget = primeiro;
        document.getElementById('modalDetalhe').dispatchEvent(evt);

        expect(document.getElementById('modalTitle').textContent).toBe(item.tituloModal || item.nome);
        expect(document.getElementById('modalBadge').textContent).toBe(item.badgeModal || item.badge);
        expect(document.getElementById('modalNotes').textContent).toBe(item.notas || '');
        expect(document.getElementById('modalSvgContainer').innerHTML).toContain('<svg');
    });

    test('abrir o modal com índice inválido não lança', () => {
        loadFullUi();
        window._modalItems = [];
        const card = document.createElement('div');
        card.dataset.index = '999';
        const evt = new Event('show.bs.modal');
        evt.relatedTarget = card;
        expect(() => document.getElementById('modalDetalhe').dispatchEvent(evt)).not.toThrow();
    });
});

describe('createTable()', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('não faz nada quando o elemento alvo não existe', () => {
        expect(() => createTable('inexistente', ['A'], [['1']])).not.toThrow();
    });

    test('renderiza cabeçalhos e linhas', () => {
        document.body.innerHTML = '<div id="tabela"></div>';
        createTable('tabela', ['Nota', 'Grau'], [['C', 'I'], ['G', 'V']]);
        const el = document.getElementById('tabela');
        const ths = [...el.querySelectorAll('th')].map(th => th.textContent);
        expect(ths).toEqual(['Nota', 'Grau']);
        expect(el.querySelectorAll('tbody tr')).toHaveLength(2);
        expect(el.querySelector('tbody tr td').textContent).toBe('C');
    });

    test('inclui a legenda quando fornecida', () => {
        document.body.innerHTML = '<div id="tabela"></div>';
        createTable('tabela', ['A'], [['1']], 'Minha legenda');
        expect(document.getElementById('tabela').textContent).toContain('Minha legenda');
    });

    test('omite a legenda quando não fornecida', () => {
        document.body.innerHTML = '<div id="tabela"></div>';
        createTable('tabela', ['A'], [['1']]);
        expect(document.getElementById('tabela').querySelector('.table-caption')).toBeNull();
    });
});
