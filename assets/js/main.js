/* =========================================================
   M&J VIDEO GAMES — ARCADE OS interactions
   ========================================================= */
(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Power flash once per visit ---------- */
  var flash = document.querySelector('.power-flash');
  if (flash) {
    var seen = false;
    try { seen = sessionStorage.getItem('mj-booted') === '1'; } catch (e) {}
    if (seen) {
      flash.remove();
    } else {
      try { sessionStorage.setItem('mj-booted', '1'); } catch (e) {}
      setTimeout(function () { if (flash.parentNode) flash.remove(); }, 1200);
    }
  }

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

    // Highlight today's hours row (single "open daily" line stays marked)
    var list = document.getElementById('hoursList');
    if (list) list.querySelectorAll('.ln').forEach(function (li) { li.classList.add('today'); });
  }
  updateHours();
  setInterval(updateHours, 60 * 1000);

  /* ---------- Contact form (FormSubmit → shop inbox) ---------- */
  var cform = document.getElementById('contactForm');
  if (cform) {
    var SHOP_EMAIL = 'rockytherockcat1@aol.com';
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('cformStatus');
      var btn = cform.querySelector('button[type="submit"]');
      var clean = function (value) { return value.replace(/[\r\n]+/g, ' ').trim(); };
      var name = clean(val('cf-name')), email = clean(val('cf-email')), phone = clean(val('cf-phone')),
          type = clean(val('cf-type')) || 'Other Question', msg = val('cf-msg');
      if (!name || !email || !msg) {
        if (status) { status.className = 'cform-status err'; status.textContent = 'ADD YOUR NAME, EMAIL & MESSAGE'; }
        return;
      }
      var subjectEl = document.getElementById('cf-subject');
      if (subjectEl) subjectEl.value = '[' + type + '] Website message from ' + name;
      if (status) { status.className = 'cform-status'; status.textContent = 'SENDING…'; }
      cform.setAttribute('aria-busy', 'true');
      if (btn) btn.disabled = true;

      var endpoint = cform.getAttribute('action');
      var payload = {
        name: name,
        email: email,
        phone: phone || '—',
        _replyto: email,
        type: type,
        message: msg,
        _subject: '[' + type + '] Website message from ' + name,
        _template: 'table',
        _captcha: 'false'
      };

      function mailtoFallback() {
        var body = 'Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + (phone || '—') +
          '\nType of request: ' + type + '\n\n' + msg + '\n';
        window.location.href = 'mailto:' + SHOP_EMAIL +
          '?subject=' + encodeURIComponent('[' + type + '] Website message from ' + name) +
          '&body=' + encodeURIComponent(body);
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (out) {
          if (out.ok && out.data && out.data.success !== false) {
            if (status) { status.className = 'cform-status ok'; status.textContent = 'MESSAGE SENT — WE\'LL GET BACK TO YOU'; }
            cform.reset();
          } else {
            if (status) { status.className = 'cform-status warn'; status.textContent = 'OPENING YOUR EMAIL APP — PLEASE SEND THE DRAFT'; }
            mailtoFallback();
          }
        })
        .catch(function () {
          if (status) { status.className = 'cform-status warn'; status.textContent = 'OPENING YOUR EMAIL APP — PLEASE SEND THE DRAFT'; }
          mailtoFallback();
        })
        .finally(function () { cform.setAttribute('aria-busy', 'false'); if (btn) btn.disabled = false; });
    });
  }

  /* ---------- Gallery category filter ---------- */
  var galFilter = document.getElementById('galFilter');
  var gallery = document.getElementById('gallery');
  if (galFilter && gallery) {
    var tiles = Array.prototype.slice.call(gallery.querySelectorAll('.gframe'));
    var galCount = document.getElementById('galCount');
    function applyFilter() {
      var val = galFilter.value, shown = 0;
      tiles.forEach(function (t) {
        var match = (val === 'all' || t.getAttribute('data-cat') === val);
        t.classList.toggle('hide', !match);
        if (match) shown++;
      });
      if (galCount) galCount.textContent = shown + (shown === 1 ? ' PHOTO' : ' PHOTOS');
    }
    galFilter.addEventListener('change', applyFilter);
    applyFilter();
  }

  /* ---------- Primary nav dropdowns (chevron tap; hover still works) ---------- */
  var topnav = document.getElementById('topnav');
  if (topnav) {
    var drops = Array.prototype.slice.call(topnav.querySelectorAll('.tn-drop'));
    function closeAll(except) {
      drops.forEach(function (d) {
        if (d === except) return;
        d.classList.remove('open');
        var b = d.querySelector('.tn-chev'); if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    drops.forEach(function (d) {
      var btn = d.querySelector('.tn-chev');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var willOpen = !d.classList.contains('open');
        closeAll(d);
        d.classList.toggle('open', willOpen);
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      d.querySelectorAll('.tn-menu a').forEach(function (a) {
        a.addEventListener('click', function () { closeAll(null); });
      });
    });
    document.addEventListener('click', function (e) { if (!topnav.contains(e.target)) closeAll(null); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(null); });
  }

  /* ---------- Open a What-We-Carry accordion when its hash is used ---------- */
  function applyHash() {
    var id = (location.hash || '').replace(/^#/, '');
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') el.open = true;
  }
  window.addEventListener('hashchange', applyHash);
  applyHash();

  /* Gold click sparks — desktop only, no cursor overlay */
  (function () {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      for (var i = 0; i < 6; i++) {
        var s = document.createElement('i');
        s.className = 'cur-spark';
        var ang = (Math.PI * 2 * i) / 6;
        s.style.left = (e.clientX - 2) + 'px';
        s.style.top = (e.clientY - 2) + 'px';
        s.style.setProperty('--sx', Math.round(Math.cos(ang) * 14) + 'px');
        s.style.setProperty('--sy', Math.round(Math.sin(ang) * 14) + 'px');
        document.body.appendChild(s);
        setTimeout(function (n) { n.remove(); }, 300, s);
      }
    });
  })();
})();
