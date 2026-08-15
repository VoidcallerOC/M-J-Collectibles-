/* =========================================================
   M&J Video Games & Collectibles — interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  var backdrop = document.getElementById('menuBackdrop');

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
  if (menu) menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Store hours (single source of truth) ----------
     day index: 0=Sun ... 6=Sat ; times in 24h decimal (12.5 = 12:30) */
  var HOURS = [
    { open: 12, close: 19 }, // Sun
    { open: 12, close: 20 }, // Mon
    { open: 12, close: 20 }, // Tue
    { open: 12, close: 20 }, // Wed
    { open: 12, close: 20 }, // Thu
    { open: 12, close: 20 }, // Fri
    { open: 12, close: 20 }  // Sat
  ];
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function fmt(t) {
    var h = Math.floor(t), m = Math.round((t - h) * 60);
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + (m < 10 ? '0' + m : m) + ' ' + ampm;
  }

  function updateHours() {
    var statusEl = document.getElementById('hoursStatus');
    var listEl = document.getElementById('hoursList');
    var now = new Date();
    var day = now.getDay();
    var nowT = now.getHours() + now.getMinutes() / 60;
    var today = HOURS[day];
    var isOpen = today && nowT >= today.open && nowT < today.close;

    // Highlight today's row + set status
    if (listEl) {
      var items = listEl.querySelectorAll('li');
      items.forEach(function (li, i) { li.classList.toggle('today', i === day); });
    }
    if (statusEl) {
      statusEl.classList.remove('open', 'closed');
      if (isOpen) {
        statusEl.classList.add('open');
        var closingSoon = today.close - nowT <= 1;
        statusEl.innerHTML = '<span class="dot"></span>' +
          (closingSoon ? 'Open · closes ' + fmt(today.close) : 'Open now · until ' + fmt(today.close));
      } else {
        statusEl.classList.add('closed');
        // Find next opening
        var msg = 'Closed';
        for (var i = 0; i < 7; i++) {
          var d = (day + i) % 7;
          var h = HOURS[d];
          if (!h) continue;
          if (i === 0 && nowT < h.open) { msg = 'Closed · opens ' + fmt(h.open) + ' today'; break; }
          if (i > 0) { msg = 'Closed · opens ' + fmt(h.open) + ' ' + (i === 1 ? DAY_NAMES[d] : DAY_NAMES[d]); break; }
        }
        statusEl.innerHTML = '<span class="dot"></span>' + msg;
      }
    }
  }
  updateHours();
  setInterval(updateHours, 60 * 1000);

  /* ---------- Hero pixel confetti ---------- */
  var pix = document.getElementById('heroPixels');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (pix && !reduce) {
    var colors = ['#E9552B', '#F2B33D', '#0F8478', '#FF7A4D', '#FFCB63'];
    var count = window.innerWidth < 640 ? 10 : 18;
    for (var i = 0; i < count; i++) {
      var el = document.createElement('i');
      el.style.left = (Math.random() * 100) + '%';
      el.style.top = (Math.random() * 100) + '%';
      el.style.background = colors[i % colors.length];
      el.style.animationDelay = (Math.random() * 9) + 's';
      el.style.animationDuration = (7 + Math.random() * 6) + 's';
      var s = 8 + Math.random() * 10;
      el.style.width = el.style.height = s + 'px';
      pix.appendChild(el);
    }
  }
})();
