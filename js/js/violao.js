/* Som de violão (nylon) com amostras reais. Uso:
   Violao.note(midi, {v:volume 0-1, ch:canal (corda), t:atraso em s})
   Violao.strum([f6..f1], {gap, v})   -> -1 = corda calada
   Violao.stop()
   Amostras: FluidR3_GM (Frank Wen), CC BY 3.0, via midi-js-soundfonts. */
(function (w) {
  var BASE = new URL('../../audio/nylon/', document.currentScript ? document.currentScript.src : location.href).href;
  var OPEN = [40, 45, 50, 55, 59, 64], MIN = 40, MAX = 84;
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
  function load(m) {
    if (bufs[m]) return bufs[m];
    return bufs[m] = fetch(BASE + m + '.mp3')
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
    var c = init(); if (c.state === 'suspended') c.resume();
    if (m < MIN || m > MAX) return Promise.resolve();
    return load(m).then(function (b) {
      var t = c.currentTime + (o.t || 0) + 0.005, v = o.v == null ? 0.8 : o.v;
      var g = c.createGain(), id = ++seq;
      g.connect(out);
      if (o.ch != null && live[o.ch]) fade(live[o.ch], 0.06);   // a mesma corda corta a nota anterior
      if (o.ch != null) live[o.ch] = g;
      if (!b) return synth(m, t, v, g);
      var s = c.createBufferSource(); s.buffer = b;
      g.gain.setValueAtTime(v, t); s.connect(g); s.start(t);
      if (o.d) { g.gain.setValueAtTime(v, t + o.d); g.gain.linearRampToValueAtTime(0, t + o.d + (o.r || 0.15)); s.stop(t + o.d + (o.r || 0.15) + 0.05); }
      live[id + 'x'] = g; s.onended = function () { delete live[id + 'x']; };
    });
  }
  function stop() { Object.keys(live).forEach(function (k) { fade(live[k], 0.08); delete live[k]; }); }
  function strum(fr, o) {
    o = o || {};
    var gap = o.gap == null ? 0.035 : o.gap, v = o.v == null ? 0.8 : o.v, ms = [];
    fr.forEach(function (f, i) { if (f >= 0) ms.push([i, OPEN[i] + f]); });
    if (o.dir === 'up') ms = ms.filter(function (x) { return x[0] >= 2; }).reverse();   // para cima: cordas agudas
    if (o.bass) ms = ms.slice(0, 1);
    if (!o.keep) stop();
    return Promise.all(ms.map(function (x) { return load(x[1]); })).then(function () {
      ms.forEach(function (x, i) { note(x[1], { t: (o.t || 0) + i * gap, v: v * (1 - i * 0.03), ch: x[0], d: o.d, r: o.r }); });
    });
  }
  function preload(fr) {
    return Promise.all(fr.map(function (f, i) { return f >= 0 ? load(OPEN[i] + f) : null; }));
  }
  w.Violao = { note: note, strum: strum, preload: preload, stop: stop, init: init, OPEN: OPEN };
})(window);
