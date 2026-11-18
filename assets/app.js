(function () {
  'use strict';
  var C = window.VH_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var brl = function (v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var num = function (v) { var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; };
  var nomes = { '24': 'Ouro 24k', '18': 'Ouro 18k', '16': 'Ouro 16k', '10': 'Ouro 10k', 'nao': 'Não sei informar' };
  var precos = C.precosCompra || { '24': 520, '18': 390, '16': 320, '10': 110 };

  /* ---------- estado compartilhado ---------- */
  var st = { karat: '', peso: '', tipo: '', calc: null, cotRef: null };

  /* ---------- menu móvel ---------- */
  var mb = $('#menuBtn'), mn = $('#mnav');
  mb.addEventListener('click', function () {
    var open = mn.hidden; mn.hidden = !open; mb.setAttribute('aria-expanded', String(open));
  });
  $$('a', mn).forEach(function (a) { a.addEventListener('click', function () { mn.hidden = true; mb.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- preços de compra ---------- */
  $$('[data-preco]').forEach(function (el) { el.textContent = brl(precos[el.getAttribute('data-preco')]); });
  $$('.js-precos-data').forEach(function (el) { el.textContent = C.precosAtualizadoEm || ''; });

  /* ---------- campos sincronizados ---------- */
  var pills = $$('.pill');
  var agKt = $('#ag-kt');
  function setKarat(k) {
    st.karat = k;
    pills.forEach(function (p) { var on = p.getAttribute('data-k') === k; p.classList.toggle('pill-on', on); p.setAttribute('aria-pressed', String(on)); });
    if (agKt.value !== k) agKt.value = k;
    $('#err').hidden = true; updateWa();
  }
  pills.forEach(function (p) { p.addEventListener('click', function () { setKarat(p.getAttribute('data-k')); }); });
  agKt.addEventListener('change', function () { setKarat(agKt.value); });
  function syncAll(cls, key) {
    var els = $$(cls);
    els.forEach(function (el) {
      el.addEventListener('input', function () {
        st[key] = el.value; els.forEach(function (o) { if (o !== el) o.value = el.value; });
        $('#err').hidden = true; updateWa();
      });
    });
  }
  syncAll('.js-peso', 'peso'); syncAll('.js-tipo', 'tipo');
  ['#ag-nome', '#ag-dia', '#ag-per'].forEach(function (s) { $(s).addEventListener('input', updateWa); $(s).addEventListener('change', updateWa); });

  /* ---------- simulador ---------- */
  $('#calc').addEventListener('click', function () {
    var w = num(st.peso), err = $('#err');
    if (!st.karat) { err.textContent = 'Selecione o tipo de ouro.'; err.hidden = false; return; }
    if (!(w > 0)) { err.textContent = 'Informe o peso da peça em gramas.'; err.hidden = false; return; }
    st.calc = { karat: st.karat, peso: w };
    renderRes(); updateWa();
  });
  function renderRes() {
    var c = st.calc; if (!c) return;
    var pesoTxt = c.peso.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' g';
    $('#rKarat').textContent = nomes[c.karat];
    $('#rPeso').textContent = pesoTxt;
    $('#rCot').textContent = st.cotRef ? brl(st.cotRef) + '/g (24k)' : '—';
    var nota = $('#rNota');
    if (c.karat === 'nao') {
      var lo = precos['10'], hi = precos['18'];
      $('#rPg').textContent = brl(lo) + ' a ' + brl(hi);
      $('#rTotal').textContent = brl(lo * c.peso) + ' a ' + brl(hi * c.peso);
      nota.textContent = 'Sem a quilatagem, mostramos uma faixa entre 10k e 18k. A avaliação presencial identifica a pureza exata.';
      nota.hidden = false;
    } else {
      var pg = precos[c.karat];
      $('#rPg').textContent = brl(pg);
      $('#rTotal').textContent = brl(pg * c.peso);
      nota.hidden = true;
    }
    $('#resBox').hidden = false; $('#emptyBox').hidden = true;
  }

  /* ---------- WhatsApp ---------- */
  function updateWa() {
    var det = [];
    var nome = $('#ag-nome').value.trim(); if (nome) det.push('Nome: ' + nome);
    if (st.tipo) det.push('Tipo de peça: ' + st.tipo);
    var pn = num(st.peso); if (pn > 0) det.push('Peso aproximado: ' + pn.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' g');
    if (st.karat) det.push('Quilatagem: ' + nomes[st.karat]);
    var q = [], dia = $('#ag-dia').value, per = $('#ag-per').value;
    if (dia) { var p = dia.split('-'); if (p.length === 3) q.push(p[2] + '/' + p[1] + '/' + p[0]); }
    if (per) q.push(per);
    if (q.length) det.push('Melhor dia e horário: ' + q.join(' — '));
    if (st.calc) det.push('Estimativa do simulador: ' + $('#rTotal').textContent);
    var msg = 'Olá, VH! Fiz uma simulação no site e gostaria de agendar uma avaliação do meu ouro. Poderia me passar mais informações?';
    var url = 'https://wa.me/' + String(C.whatsapp || '5561984489331').replace(/\D/g, '') + '?text=' + encodeURIComponent(msg + (det.length ? '\n\n' + det.join('\n') : ''));
    $$('.js-wa').forEach(function (a) { a.href = url; });
  }
  updateWa();

  /* ---------- cotação automática ---------- */
  function showQuotes(d, reserva) {
    ['ouro', 'prata', 'platina'].forEach(function (m) {
      ['bid', 'ask'].forEach(function (k) {
        var el = $('[data-q="' + m + '.' + k + '"]');
        if (el && d[m] && d[m][k] != null) el.textContent = brl(d[m][k]);
      });
    });
    $$('.js-upd').forEach(function (el) { el.textContent = d.atualizadoEm || '—'; });
    $('#fonteTag').textContent = 'Fonte: ' + (d.fonte || '—') + (reserva ? '' : ' · automática');
    st.cotRef = d.ouro && d.ouro.bid; renderRes();
  }
  function fmtData(iso) {
    var dt = new Date(iso); if (isNaN(dt)) return '';
    return dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' às ' + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  }
  function loadQuotes() {
    if (!C.apiCotacao || !window.fetch) { showQuotes(C.cotacaoReserva, true); return; }
    fetch(C.apiCotacao, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) {
        if (!d || !d.ouro || !d.ouro.bid) throw new Error('sem dados');
        d.atualizadoEm = fmtData(d.atualizadoEm) || d.atualizadoEm;
        showQuotes(d, false);
      })
      .catch(function () { showQuotes(C.cotacaoReserva, true); });
  }
  showQuotes(C.cotacaoReserva, true);
  loadQuotes();
  setInterval(loadQuotes, Math.max(1, C.atualizarACadaMinutos || 5) * 60000);

  /* ---------- alianças 3D ---------- */
  var stage = $('#stage'), scene = $('#scene');
  var rx = -10, ry = -55, trx = -10, yaw = -55, vel = 0.15, drag = false, lx = 0, ly = 0, hx = 0, hy = 0, idle = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  stage.addEventListener('pointerdown', function (e) { drag = true; lx = e.clientX; ly = e.clientY; vel = 0; idle = 0; try { stage.setPointerCapture(e.pointerId); } catch (x) {} });
  stage.addEventListener('pointermove', function (e) {
    idle = 0;
    if (drag) {
      var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
      yaw += dx * 0.45; vel = dx * 0.45; trx = Math.max(-50, Math.min(30, trx - dy * 0.3));
    } else if (e.pointerType === 'mouse') {
      var r = stage.getBoundingClientRect();
      hx = ((e.clientX - r.left) / r.width - 0.5) * 2; hy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }
  });
  var up = function () { drag = false; };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('pointerleave', function () { if (!drag) { hx = 0; hy = 0; } });
  var nz = function (v) { var l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  var L = nz([-0.5, -0.65, 0.58]), H = nz([L[0], L[1], L[2] + 1]);
  var toLocal = function (v, ca, sa, cb, sb) { var y = v[1] * ca + v[2] * sa, z = -v[1] * sa + v[2] * ca, x = v[0]; return [x * cb - z * sb, y, x * sb + z * cb]; };
  (function tick() {
    if (!drag) {
      yaw += vel; vel *= 0.95; idle += 1;
      if (!reduce && idle > 120 && Math.abs(vel) < 0.12) vel += (0.12 - vel) * 0.02;
      if (idle > 180) trx += (-10 - trx) * 0.02;
    }
    ry += (yaw + hx * 28 - ry) * 0.12; rx += (trx - hy * 14 - rx) * 0.12;
    var a = rx * Math.PI / 180, b = ry * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    var Ll = toLocal(L, ca, sa, cb, sb), Hl = toLocal(H, ca, sa, cb, sb), s = scene.style;
    s.setProperty('--rx', rx.toFixed(2) + 'deg'); s.setProperty('--ry', ry.toFixed(2) + 'deg');
    s.setProperty('--dC', Math.hypot(Ll[1], Ll[2]).toFixed(3)); s.setProperty('--dP', (Math.atan2(Ll[1], Ll[2]) * 180 / Math.PI).toFixed(2) + 'deg');
    s.setProperty('--sC', Math.hypot(Hl[1], Hl[2]).toFixed(3)); s.setProperty('--sP', (Math.atan2(Hl[1], Hl[2]) * 180 / Math.PI).toFixed(2) + 'deg');
    s.setProperty('--eR', (0.4 + 0.8 * Math.max(0, Ll[0]) + 0.8 * Math.pow(Math.max(0, Hl[0]), 8)).toFixed(3));
    s.setProperty('--eL', (0.4 + 0.8 * Math.max(0, -Ll[0]) + 0.8 * Math.pow(Math.max(0, -Hl[0]), 8)).toFixed(3));
    requestAnimationFrame(tick);
  })();
})();
