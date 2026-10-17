/* Acordes: nome, forma tocável (aberta ou móvel de pestana), dedos e diagrama.
   AcLib.voz(raiz 0-11, q) -> [f6..f1] (-1 = calada)
   q: M m dim 7 M7 m7 m7b5
   AcLib.nome(raiz, q, bemol) / AcLib.svg(frets, raiz) / AcLib.campo(tom, modo, com7, vMaior) */
(function (w) {
  var OP = [4, 9, 2, 7, 11, 4], SH = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], FL = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  var SUF = { M: '', m: 'm', dim: '°', '7': '7', M7: 'maj7', m7: 'm7', m7b5: 'm7♭5', sus2: 'sus2', sus4: 'sus4', aug: '+', '6': '6', m6: 'm6', '5': '5' };
  // intervalos (semitons) de cada tipo; os cinco últimos só valem para teclado (não têm forma de violão)
  var IV = { M: [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], '7': [0, 4, 7, 10], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], sus2: [0, 2, 7], sus4: [0, 5, 7], aug: [0, 4, 8], '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], '5': [0, 7] };
  var QN = { M: 'Maior', m: 'Menor', dim: 'Diminuto', '7': 'Dominante 7', M7: 'Maior com 7ª maior', m7: 'Menor com 7ª', m7b5: 'Meio-diminuto', sus2: 'Suspenso 2', sus4: 'Suspenso 4', aug: 'Aumentado', '6': 'Maior com 6ª', m6: 'Menor com 6ª', '5': 'Power chord (quinta)' };
  // formas abertas por nota (0=C ...) e formas móveis (corda da raiz: 0=Mi grave, 1=Lá, 2=Ré; -9 = calada)
  var ABERTA = {
    M: { 0: [-1, 3, 2, 0, 1, 0], 2: [-1, -1, 0, 2, 3, 2], 4: [0, 2, 2, 1, 0, 0], 7: [3, 2, 0, 0, 0, 3], 9: [-1, 0, 2, 2, 2, 0] },
    m: { 9: [-1, 0, 2, 2, 1, 0], 4: [0, 2, 2, 0, 0, 0], 2: [-1, -1, 0, 2, 3, 1] },
    '7': { 0: [-1, 3, 2, 3, 1, 0], 2: [-1, -1, 0, 2, 1, 2], 4: [0, 2, 0, 1, 0, 0], 7: [3, 2, 0, 0, 0, 1], 9: [-1, 0, 2, 0, 2, 0], 11: [-1, 2, 1, 2, 0, 2] },
    M7: { 0: [-1, 3, 2, 0, 0, 0], 2: [-1, -1, 0, 2, 2, 2], 4: [0, 2, 1, 1, 0, 0], 7: [3, 2, 0, 0, 0, 2], 9: [-1, 0, 2, 1, 2, 0] },
    m7: { 9: [-1, 0, 2, 0, 1, 0], 4: [0, 2, 0, 0, 0, 0], 2: [-1, -1, 0, 2, 1, 1] }
  };
  var N = null;
  var MOVEL = {
    M: [[0, [0, 2, 2, 1, 0, 0]], [1, [N, 0, 2, 2, 2, 0]]],
    m: [[0, [0, 2, 2, 0, 0, 0]], [1, [N, 0, 2, 2, 1, 0]]],
    '7': [[0, [0, 2, 0, 1, 0, 0]], [1, [N, 0, 2, 0, 2, 0]]],
    M7: [[0, [0, 2, 1, 1, 0, 0]], [1, [N, 0, 2, 1, 2, 0]]],
    m7: [[0, [0, 2, 0, 0, 0, 0]], [1, [N, 0, 2, 0, 1, 0]]],
    dim: [[1, [N, 0, 1, N, 1, N]], [2, [N, N, 0, 1, 3, 1]]],
    m7b5: [[1, [N, 0, 1, 0, 1, N]], [2, [N, N, 0, 1, 1, 1]]],
    '5': [[0, [0, 2, 2, N, N, N]], [1, [N, 0, 2, 2, N, N]]]
  };
  function voz(r, q) {
    var o = ABERTA[q] && ABERTA[q][r];
    if (o) return o.slice();
    var melhor = null;
    (MOVEL[q] || MOVEL.M).forEach(function (m) {
      var k = ((r - OP[m[0]]) % 12 + 12) % 12;
      var f = m[1].map(function (x) { return x === null ? -1 : x + k; });
      if (!melhor || k < melhor.k) melhor = { k: k, f: f };
    });
    return melhor.f;
  }
  function nome(r, q, bemol) { return (bemol ? FL : SH)[r] + SUF[q]; }
  // dedos: null se impossível (mais de 4 dedos, abertura > 4 casas)
  function dedos(fr) {
    var fz = []; fr.forEach(function (f, s) { if (f > 0) fz.push([s, f]); });
    if (!fz.length) return { bar: null, dots: [] };
    var f0 = Math.min.apply(0, fz.map(function (x) { return x[1]; }));
    if (Math.max.apply(0, fz.map(function (x) { return x[1]; })) - f0 > 3) return null;
    var s0 = fz.filter(function (x) { return x[1] === f0; }).map(function (x) { return x[0]; }), bar = null, rest = fz;
    if (fz.length > 4) {
      if (s0.length < 2) return null;
      var a = s0[0], b = s0[s0.length - 1];
      for (var s = a; s <= b; s++) if (fr[s] < f0) return null;
      bar = { f: f0, from: a, to: b }; rest = fz.filter(function (x) { return x[1] !== f0; });
    }
    rest = rest.slice().sort(function (x, y) { return x[1] - y[1] || x[0] - y[0]; });
    var first = bar ? 2 : 1;
    if (rest.length + first - 1 > 4) return null;
    return { bar: bar, dots: rest.map(function (x, i) { return { s: x[0], f: x[1], d: first + i }; }) };
  }
  function svg(fr, root) {
    var d = dedos(fr), fz = fr.filter(function (f) { return f > 0; });
    if (!d) d = { bar: null, dots: fr.map(function (f, s) { return f > 0 ? { s: s, f: f, d: '' } : null; }).filter(Boolean) };
    var pos = fz.length ? Math.min.apply(0, fz) : 0, mx = fr.length ? Math.max.apply(0, fr) : 0;
    var base = pos > 0 && mx <= 5 ? 1 : Math.max(pos, 1);
    var X = function (s) { return 20 + s * 14; }, Y = function (f) { return 26 + (f - base) * 20 + 10; };
    var h = '<svg viewBox="0 0 110 134" aria-hidden="true">';
    if (base === 1) h += '<rect x="19" y="23" width="72" height="4" fill="#e8d5a3"/>';
    else h += '<text x="2" y="' + (Y(pos) + 4) + '" fill="#b5b0a8" font-size="10">' + pos + 'ª</text>';
    for (var r = 0; r <= 5; r++) h += '<line x1="20" x2="90" y1="' + (26 + r * 20) + '" y2="' + (26 + r * 20) + '" stroke="#6b6780"/>';
    for (var i = 0; i < 6; i++) {
      h += '<line x1="' + X(i) + '" x2="' + X(i) + '" y1="26" y2="126" stroke="#9c97b0"/>';
      if (fr[i] < 0) h += '<text x="' + X(i) + '" y="18" fill="#ff7b7b" font-size="12" text-anchor="middle">x</text>';
      else if (fr[i] === 0) h += '<circle cx="' + X(i) + '" cy="14" r="4" fill="none" stroke="#7ee08a"/>';
    }
    if (d.bar) h += '<rect x="' + (X(d.bar.from) - 6) + '" y="' + (Y(d.bar.f) - 6) + '" width="' + (X(d.bar.to) - X(d.bar.from) + 12) + '" height="12" rx="6" fill="#e8d5a3" opacity=".7"/><text x="' + X(d.bar.from) + '" y="' + (Y(d.bar.f) + 3) + '" font-size="8" font-weight="700" fill="#0e0d1a" text-anchor="middle">1</text>';
    d.dots.forEach(function (x) {
      h += '<circle cx="' + X(x.s) + '" cy="' + Y(x.f) + '" r="7" fill="' + ((OP[x.s] + x.f) % 12 === root ? '#c9a959' : '#f0f0f0') + '"/><text x="' + X(x.s) + '" y="' + (Y(x.f) + 3.5) + '" font-size="9" font-weight="700" fill="#0e0d1a" text-anchor="middle">' + x.d + '</text>';
    });
    return h + '</svg>';
  }
  // campo harmônico: graus com raiz, qualidade e número romano
  var CAMPO = {
    M: { iv: [0, 2, 4, 5, 7, 9, 11], q: ['M', 'm', 'm', 'M', 'M', 'm', 'dim'], q7: ['M7', 'm7', 'm7', 'M7', '7', 'm7', 'm7b5'], rn: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'] },
    m: { iv: [0, 2, 3, 5, 7, 8, 10], q: ['m', 'dim', 'M', 'm', 'm', 'M', 'M'], q7: ['m7', 'm7b5', 'M7', 'm7', 'm7', 'M7', '7'], rn: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'] }
  };
  function campo(tom, modo, com7, vMaior) {
    var c = CAMPO[modo], bemol = modo === 'M' ? [1, 3, 5, 8, 10].indexOf(tom) >= 0 : [0, 2, 3, 5, 7, 10].indexOf(tom) >= 0;
    return c.iv.map(function (iv, i) {
      var q = com7 ? c.q7[i] : c.q[i], rn = c.rn[i];
      if (modo === 'm' && i === 4 && vMaior) { q = com7 ? '7' : 'M'; rn = 'V'; }
      return { r: (tom + iv) % 12, q: q, rn: rn, bemol: bemol };
    });
  }
  w.AcLib = { IV: IV, QN: QN, voz: voz, nome: nome, svg: svg, campo: campo, NOTAS: SH, BEMOL: FL };
})(window);
