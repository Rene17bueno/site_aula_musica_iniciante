/* Sons de instrumentos com amostras reais (violão, guitarras, baixo, piano, órgão, cordas). Uso:
   Violao.use('piano')  -> instrumento padrão (nylon se não chamar)
   Violao.picker(select, ['nylon','piano'], 'chave')  -> preenche um <select> e guarda a escolha
   Violao.note(midi, {v:volume 0-1, ch:canal (corda), t:atraso em s, inst:'baixo'})
   Violao.strum([f6..f1], {gap, v})   -> -1 = corda calada
   Violao.stop()
   Amostras: FluidR3_GM (Frank Wen), CC BY 3.0, via midi-js-soundfonts. */
(function (w) {
  var BASE = new URL('../../audio/', document.currentScript ? document.currentScript.src : location.href).href;
  var OPEN = [40, 45, 50, 55, 59, 64];
  // dir = pasta em audio/, min/max = notas MIDI com amostra, g = ganho, loop = trecho repetido p/ notas longas
  var INST = {
    nylon: { n: 'Violão (nylon)', min: 40, max: 84, g: 1 },
    guitarra: { n: 'Guitarra limpa', min: 40, max: 88, g: 0.9 },
    'guitarra-crunch': { n: 'Guitarra crunch', min: 40, max: 88, g: 0.7 },
    'guitarra-dist': { n: 'Guitarra distorcida', min: 40, max: 88, g: 0.55 },
    piano: { n: 'Piano', min: 36, max: 96, g: 1 },
    epiano: { n: 'Piano elétrico', min: 36, max: 96, g: 0.9 },
    orgao: { n: 'Órgão', min: 36, max: 96, g: 0.7, loop: [1.0, 2.6] },
    cordas: { n: 'Cordas', min: 36, max: 96, g: 0.8, loop: [1.0, 2.6] },
    baixo: { n: 'Baixo elétrico (dedos)', min: 28, max: 67, g: 1.1 },
    'baixo-pua': { n: 'Baixo elétrico (palheta)', min: 28, max: 67, g: 1.1 }
  };
  var cur = 'nylon';
  var ctx, out, bufs = {}, live = {}, seq = 0;

  function init() {
    if (ctx) return ctx;
    ctx = new (w.AudioContext || w.webkitAudioContext)();
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    out = ctx.createGain(); out.gain.value = 0.9;
    out.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function load(m, i) {
    i = i || cur; var k = i + m;
    if (bufs[k]) return bufs[k];
    return bufs[k] = fetch(BASE + i + '/' + m + '.mp3')
      .then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(function (a) { return new Promise(function (ok, no) { init().decodeAudioData(a, ok, no); }); })
      .catch(function () { return null; });
  }
  function fade(g, s) {                       // silencia um som que está tocando
    try { g.gain.cancelScheduledValues(ctx.currentTime); g.gain.setValueAtTime(g.gain.value, ctx.currentTime); g.gain.linearRampToValueAtTime(0, ctx.currentTime + s); } catch (e) {}
  }
  function synth(m, t, v, g) {                // reserva: sem internet e sem cópia guardada
    var o = ctx.createOscillator();
    o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v * 0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(g); o.start(t); o.stop(t + 1.3);
  }
  function note(m, o) {
    o = o || {};
    var i = o.inst || cur, I = INST[i], c = init(); if (c.state === 'suspended') c.resume();
    if (m < I.min || m > I.max) return Promise.resolve();
    return load(m, i).then(function (b) {
      var t = c.currentTime + (o.t || 0) + 0.005, v = (o.v == null ? 0.8 : o.v) * I.g, d = o.d || (I.loop && !o.hold ? 1.4 : 0);
      var g = c.createGain(), id = ++seq;
      g.connect(out);
      if (o.ch != null && live[o.ch]) fade(live[o.ch], 0.06);   // a mesma corda corta a nota anterior
      if (o.ch != null) live[o.ch] = g;
      if (!b) { synth(m, t, v, g); return function () {}; }
      var s = c.createBufferSource(); s.buffer = b;
      g.gain.setValueAtTime(v, t); s.connect(g);
      if (I.loop) { s.loop = true; s.loopStart = I.loop[0]; s.loopEnd = I.loop[1]; }
      s.start(t);
      if (d) { g.gain.setValueAtTime(v, t + d); g.gain.linearRampToValueAtTime(0, t + d + (o.r || 0.15)); s.stop(t + d + (o.r || 0.15) + 0.05); }
      live[id + 'x'] = g; s.onended = function () { delete live[id + 'x']; };
      return function (r) {                    // solta a nota (tecla levantada)
        r = r || 0.15; try { fade(g, r); s.stop(c.currentTime + r + 0.05); } catch (e) {}
      };
    });
  }
  function use(i) { if (INST[i]) cur = i; return cur; }
  function picker(sel, ids, key) {
    var saved; try { saved = localStorage.getItem(key); } catch (e) {}
    sel.innerHTML = ids.map(function (i) { return '<option value="' + i + '">' + INST[i].n + '</option>'; }).join('');
    sel.value = ids.indexOf(saved) >= 0 ? saved : ids[0];
    use(sel.value);
    sel.addEventListener('change', function () { use(sel.value); try { localStorage.setItem(key, sel.value); } catch (e) {} if (sel.onuse) sel.onuse(sel.value); });
    return sel;
  }
  function stop() { Object.keys(live).forEach(function (k) { fade(live[k], 0.08); delete live[k]; }); }
  function strum(fr, o) {
    o = o || {};
    var gap = o.gap == null ? 0.035 : o.gap, v = o.v == null ? 0.8 : o.v, ms = [];
    fr.forEach(function (f, i) { if (f >= 0) ms.push([i, OPEN[i] + f]); });
    if (o.dir === 'up') ms = ms.filter(function (x) { return x[0] >= 2; }).reverse();   // para cima: cordas agudas
    if (o.bass) ms = ms.slice(0, 1);
    if (!o.keep) stop();
    return Promise.all(ms.map(function (x) { return load(x[1], o.inst); })).then(function () {
      ms.forEach(function (x, i) { note(x[1], { t: (o.t || 0) + i * gap, v: v * (1 - i * 0.03), ch: x[0], d: o.d, r: o.r, inst: o.inst }); });
    });
  }
  function preload(fr) {
    return Promise.all(fr.map(function (f, i) { return f >= 0 ? load(OPEN[i] + f) : null; }));
  }
  function preloadRange(a, b, i) {
    var I = INST[i || cur], r = [];
    for (var m = Math.max(a, I.min); m <= Math.min(b, I.max); m++) r.push(load(m, i));
    return Promise.all(r);
  }
  w.Violao = { note: note, strum: strum, preload: preload, preloadRange: preloadRange, stop: stop, init: init, OPEN: OPEN, use: use, picker: picker, INST: INST, ctx: function () { return init(); } };
})(window);
