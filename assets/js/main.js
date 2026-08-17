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
    // When closed, remove the drawer from the tab order and accessibility tree
    // so off-screen links can't receive focus. Use the `hidden` attribute as a
    // robust fallback alongside inert (which older browsers ignore).
    if (open) {
      drawer.removeAttribute('hidden');
      drawer.setAttribute('aria-hidden', 'false');
      if (drawer.hasAttribute('inert')) drawer.removeAttribute('inert');
      // Move focus into the drawer when it opens
      var firstLink = drawer.querySelector('a');
      if (firstLink) firstLink.focus();
    } else {
      drawer.setAttribute('aria-hidden', 'true');
      // inert prevents focus + pointer events on descendants; hidden also hides it.
      try { drawer.setAttribute('inert', ''); } catch (e) {}
      // (Don't set `hidden` while the slide-out CSS transition runs, or it
      // snaps shut. inert alone is enough to block keyboard access.)
      if (!('inert' in document.documentElement)) {
        // No inert support: fall back to tabindex -1 on every link.
        drawer.querySelectorAll('a,button').forEach(function (el) {
          if (open) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      }
    }
  }
  // Start with the drawer closed/inert so links aren't focusable on load.
  setDrawer(false);
  if (menuBtn) menuBtn.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  if (drawerBg) drawerBg.addEventListener('click', function () { setDrawer(false); });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); if (menuBtn) menuBtn.focus(); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) { setDrawer(false); if (menuBtn) menuBtn.focus(); } });

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

  // Get current day-of-week and decimal hour in US Eastern time (handles DST).
  // Falls back to local time if the browser lacks Intl timeZone support.
  function etParts() {
    var tz = 'America/New_York';
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var wd = '', hh = 0, mm = 0;
      for (var i = 0; i < parts.length; i++) {
        var pt = parts[i];
        if (pt.type === 'weekday') wd = pt.value;
        else if (pt.type === 'hour') hh = parseInt(pt.value, 10);
        else if (pt.type === 'minute') mm = parseInt(pt.value, 10);
      }
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var day = map[wd];
      if (day === undefined) return null;          // unexpected weekday string
      return { day: day, t: hh + mm / 60 };
    } catch (e) { return null; }
  }

  function updateHours() {
    var et = etParts() || { day: new Date().getDay(), t: new Date().getHours() + new Date().getMinutes() / 60 };
    var day = et.day, nowT = et.t;
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
      if (!sprite.classList.contains('on')) sprite.classList.add('on');
      if (!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });

    window.addEventListener('pointerleave', function () { sprite.classList.remove('on'); });
  })();

  /* ---------- Contact form (composes an email to the shop) ---------- */
  var cform = document.getElementById('contactForm');
  if (cform) {
    var SHOP_EMAIL = 'rockythetockcat1@aol.com';
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('cformStatus');
      var name = val('cf-name'), email = val('cf-email'), phone = val('cf-phone'),
          type = val('cf-type') || 'Other Question', msg = val('cf-msg');
      if (!name || !email || !msg) {
        if (status) { status.className = 'cform-status err'; status.textContent = 'ADD YOUR NAME, EMAIL & MESSAGE'; }
        return;
      }
      var subject = '[' + type + '] Website message from ' + name;
      var body = 'Name: ' + name + '\n' +
                 'Email: ' + email + '\n' +
                 'Phone: ' + (phone || '—') + '\n' +
                 'Type of request: ' + type + '\n\n' +
                 msg + '\n';
      if (status) { status.className = 'cform-status ok'; status.textContent = 'OPENING YOUR EMAIL APP…'; }
      window.location.href = 'mailto:' + SHOP_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }
})();
