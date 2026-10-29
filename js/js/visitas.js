/* Registra a visita + injeta o botão oculto do painel. Incluir em TODAS as páginas:
   <script src="js/js/visitas.js" defer></script> */
(() => {
  const SB_URL = 'https://leaydrhjqbjpuzjnnvus.supabase.co';      // https://xxxx.supabase.co
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlYXlkcmhqcWJqcHV6am5udnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTY1MTAsImV4cCI6MjEwODg3MjUxMH0.Hw2LNI4lsFdZcMOz2hat2jTsAD1TsH_SN5V3XD0fnOk';  // chave anon (pública). NUNCA a service_role.

  // Botão oculto (canto esquerdo do menu, onde está o retângulo vermelho)
  const a = document.createElement('a');
  a.href = window.__ADMIN_URL || 'admin-visitas.html';
  a.setAttribute('aria-label', 'Painel');
  a.style.cssText = 'position:fixed;top:20px;left:24px;width:54px;height:26px;z-index:2000;opacity:0;cursor:default';
  document.body.appendChild(a);

  const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
  const ss = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : sessionStorage.setItem(k, v); } catch { return null; } };

  const ua = navigator.userAgent;
  if (ls('nao_contar') === '1' || navigator.webdriver || /bot|crawl|spider|headless|lighthouse/i.test(ua)
      || /^(localhost|127\.)/.test(location.hostname) || !SB_URL.startsWith('http')) return;
  if (/admin-visitas/.test(location.pathname)) return;

  const uid = () => crypto.randomUUID();
  let visitante = ls('vid'); if (!visitante) ls('vid', visitante = uid());
  let sessao = ss('sid');    if (!sessao)    ss('sid', sessao = uid());

  const q = new URLSearchParams(location.search);
  let origem = q.get('utm_source');
  if (!origem) {
    if (/musical_ly|TikTok|Bytedance/i.test(ua)) origem = 'tiktok';
    else if (/Instagram/i.test(ua)) origem = 'instagram';
    else if (/FBAN|FBAV/i.test(ua)) origem = 'facebook';
    else if (document.referrer) {
      try { const h = new URL(document.referrer).hostname.replace(/^www\./, ''); origem = h === location.hostname ? 'interno' : h; } catch { origem = 'outro'; }
    } else origem = 'direto';
  }

  const pick = (list, d) => (list.find(([r]) => r.test(ua)) || [0, d])[1];
  const dispositivo = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'Celular' : 'Computador';
  const navegador = pick([[/Edg\//, 'Edge'], [/OPR\//, 'Opera'], [/Firefox\//, 'Firefox'], [/Chrome\//, 'Chrome'], [/Safari\//, 'Safari']], 'Outro');
  const so = pick([[/Windows/, 'Windows'], [/Android/, 'Android'], [/iPhone|iPad|iOS/, 'iOS'], [/Mac OS/, 'macOS'], [/Linux/, 'Linux']], 'Outro');

  fetch(SB_URL + '/rest/v1/visitas', {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({
      visitante_id: visitante, sessao_id: sessao,
      pagina: location.pathname.split('/').pop() || 'index.html',
      titulo: document.title.slice(0, 200),
      origem, referrer: document.referrer.slice(0, 300) || null, utm_campaign: q.get('utm_campaign'),
      dispositivo, navegador, so,
      idioma: navigator.language, tela: screen.width + 'x' + screen.height,
      fuso: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }).catch(() => {});
})();
