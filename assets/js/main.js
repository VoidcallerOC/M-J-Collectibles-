/* =========================================================
   M&J VIDEO GAMES — ARCADE OS interactions
   ========================================================= */
(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Remove power flash node after it plays ---------- */
  var flash = document.querySelector('.power-flash');
  if (flash) setTimeout(function () { flash.remove(); }, 1200);

  /* ---------- Mobile drawer ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  var drawerBg = document.getElementById('drawerBg');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    if (drawerBg) drawerBg.classList.toggle('open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  if (drawerBg) drawerBg.addEventListener('click', function () { setDrawer(false); });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- Reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Main menu: arrow-key navigation ---------- */
  var menu = document.getElementById('mainMenu');
  if (menu) {
    var links = Array.prototype.slice.call(menu.querySelectorAll('a'));
    var idx = 0;
    function select(i, focus) {
      idx = (i + links.length) % links.length;
      links.forEach(function (a, n) { a.classList.toggle('sel', n === idx); });
      if (focus) links[idx].focus();
    }
    select(0, false);
    links.forEach(function (a, n) { a.addEventListener('mouseenter', function () { select(n, false); }); });
    // Only hijack arrows while the menu (or its links) has focus
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(idx + 1, true); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(idx - 1, true); }
      else if (e.key === 'Enter' && document.activeElement === links[idx]) { /* native anchor handles */ }
    });
  }

  /* ---------- Store hours (single source of truth) ---------- */
  var HOURS = [
    { open: 11, close: 19 }, // Sun
    { open: 11, close: 19 }, // Mon
    { open: 11, close: 19 }, // Tue
    { open: 11, close: 19 }, // Wed
    { open: 11, close: 19 }, // Thu
    { open: 11, close: 19 }, // Fri
    { open: 11, close: 19 }  // Sat
  ];
  var DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  function fmt(t) {
    var h = Math.floor(t), m = Math.round((t - h) * 60);
    var ap = h >= 12 ? 'PM' : 'AM', hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
  }

  function updateHours() {
    var now = new Date(), day = now.getDay();
    var nowT = now.getHours() + now.getMinutes() / 60;
    var t = HOURS[day];
    var open = t && nowT >= t.open && nowT < t.close;

    var longMsg;
    if (open) {
      longMsg = (t.close - nowT <= 1) ? 'OPEN — CLOSING ' + fmt(t.close) : 'OPEN — UNTIL ' + fmt(t.close);
    } else {
      longMsg = 'CLOSED';
      for (var i = 0; i < 7; i++) {
        var d = (day + i) % 7, h = HOURS[d];
        if (!h) continue;
        if (i === 0 && nowT < h.open) { longMsg = 'CLOSED — OPENS ' + fmt(h.open); break; }
        if (i > 0) { longMsg = 'CLOSED — OPENS ' + DAY[d] + ' ' + fmt(h.open); break; }
      }
    }

    // HUD short badge
    var hud = document.getElementById('hudStatus');
    if (hud) { hud.classList.toggle('on', open); hud.classList.toggle('off', !open); hud.innerHTML = '<span class="dot"></span>' + (open ? 'OPEN' : 'CLOSED'); }

    // Terminal
    var ts = document.getElementById('termStatus');
    if (ts) ts.textContent = longMsg;
    var tstat = document.getElementById('termStat');
    if (tstat) { tstat.classList.toggle('on', open); tstat.classList.toggle('off', !open); tstat.textContent = open ? '● ONLINE' : '● OFFLINE'; }

    // Highlight today's hours row
    var list = document.getElementById('hoursList');
    if (list) list.querySelectorAll('.ln').forEach(function (li, i) { li.classList.toggle('today', i === day); });
  }
  updateHours();
  setInterval(updateHours, 60 * 1000);

  /* ---------- Retro cursor follower ---------- */
  (function () {
    if (window.matchMedia('(hover: none)').matches) return;       // touch device
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var sprite = document.createElement('div');
    sprite.className = 'cursor-sprite';
    document.body.appendChild(sprite);

    var tx = -100, ty = -100, cx = -100, cy = -100, raf = null;

    function frame() {
      cx += (tx - cx) * 0.22;   // ease toward the pointer (slight lag)
      cy += (ty - cy) * 0.22;
      sprite.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = null;
      }
    }

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      sprite.classList.add('on');
      sprite.classList.remove('thrust'); void sprite.offsetWidth; sprite.classList.add('thrust');
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    window.addEventListener('pointerleave', function () { sprite.classList.remove('on'); });
  })();
})();
