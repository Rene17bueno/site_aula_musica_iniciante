/* Braço horizontal (guitarra, baixo...) em SVG. Uso:
   Braco.draw(el, {open:[40,45,50,55,59,64], n:15, mark:(midi,corda,casa)=>({t:'texto',c:'root|sc|on'})|null, click:(midi,corda,casa)=>{}})
   corda 0 = mais grave (fica embaixo). */
(function (w) {
  function draw(el, o) {
    var S = o.open.length, n = o.n || 15, W = 56, X0 = 34, G = 30, H = (S - 1) * G + 36, T = 14;
    var s = '<svg viewBox="0 0 ' + (X0 + n * W + 12) + ' ' + (H + T) + '" style="min-width:' + Math.round((X0 + n * W) * 0.62) + 'px;width:100%" role="img">';
    s += '<rect x="' + X0 + '" y="' + (T + 8) + '" width="' + n * W + '" height="' + (S - 1) * G + '" fill="#241f35"/>';
    for (var f = 0; f <= n; f++) {
      s += '<line x1="' + (X0 + f * W) + '" x2="' + (X0 + f * W) + '" y1="' + (T + 8) + '" y2="' + (T + 8 + (S - 1) * G) + '" stroke="' + (f ? '#6b6780' : '#e8d5a3') + '" stroke-width="' + (f ? 2 : 6) + '"/>';
      if (f) s += '<text x="' + (X0 + f * W - W / 2) + '" y="' + (T + 6) + '" fill="#8f8a82" font-size="11" text-anchor="middle">' + f + '</text>';
    }
    [3, 5, 7, 9, 12, 15].forEach(function (f) {
      if (f > n) return; var cx = X0 + f * W - W / 2, cy = T + 8 + (S - 1) * G / 2;
      s += f === 12 ? '<circle cx="' + cx + '" cy="' + (cy - G) + '" r="4" fill="#3a3750"/><circle cx="' + cx + '" cy="' + (cy + G) + '" r="4" fill="#3a3750"/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#3a3750"/>';
    });
    for (var i = 0; i < S; i++) {
      var y = T + 8 + (S - 1 - i) * G;
      s += '<line x1="' + X0 + '" x2="' + (X0 + n * W) + '" y1="' + y + '" y2="' + y + '" stroke="#b5b0a8" stroke-width="' + (1 + (S - 1 - (S - 1 - i)) * 0.35 + (i < 2 ? 0.8 : 0)) + '"/>';
    }
    for (var c = 0; c < S; c++) for (var fr = 0; fr <= n; fr++) {
      var m = o.open[c] + fr, k = o.mark ? o.mark(m, c, fr) : null;
      var cx2 = fr ? X0 + fr * W - W / 2 : X0 - 16, cy2 = T + 8 + (S - 1 - c) * G;
      if (k) s += '<g data-m="' + m + '" data-c="' + c + '" data-f="' + fr + '" class="nk ' + (k.c || '') + '"><circle cx="' + cx2 + '" cy="' + cy2 + '" r="12"/><text x="' + cx2 + '" y="' + (cy2 + 4) + '" text-anchor="middle">' + (k.t || '') + '</text></g>';
      else if (o.click) s += '<g data-m="' + m + '" data-c="' + c + '" data-f="' + fr + '" class="nk ghost"><circle cx="' + cx2 + '" cy="' + cy2 + '" r="12"/></g>';
    }
    el.innerHTML = s + '</svg>';
    if (o.click) el.querySelectorAll('.nk').forEach(function (g) { g.onclick = function () { o.click(+g.dataset.m, +g.dataset.c, +g.dataset.f); }; });
  }
  w.Braco = { draw: draw };
})(window);
