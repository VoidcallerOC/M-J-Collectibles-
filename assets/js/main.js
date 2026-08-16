/* =========================================================
   M&J Video Games & Collectibles — interactions
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile drawer ---------- */
  var toggle = document.getElementById('tbToggle');
  var drawer = document.getElementById('drawer');
  var drawerBg = document.getElementById('drawerBg');

  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    if (drawerBg) drawerBg.classList.toggle('open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
  if (drawerBg) drawerBg.addEventListener('click', function () { setDrawer(false); });
  if (drawer) drawer.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setDrawer(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Active section in rail nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#railNav a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = '#' + en.target.id;
          navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Store hours (single source of truth) ----------
     day index: 0=Sun ... 6=Sat ; 24h decimal */
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
    var now = new Date();
    var day = now.getDay();
    var nowT = now.getHours() + now.getMinutes() / 60;
    var today = HOURS[day];
    var isOpen = today && nowT >= today.open && nowT < today.close;

    // message text
    var msg;
    if (isOpen) {
      msg = (today.close - nowT <= 1) ? 'Closing ' + fmt(today.close) : 'Open · until ' + fmt(today.close);
    } else {
      msg = 'Closed';
      for (var i = 0; i < 7; i++) {
        var d = (day + i) % 7, h = HOURS[d];
        if (!h) continue;
        if (i === 0 && nowT < h.open) { msg = 'Opens ' + fmt(h.open) + ' today'; break; }
        if (i > 0) { msg = 'Opens ' + DAY_NAMES[d] + ' ' + fmt(h.open); break; }
      }
    }

    // Visit readout + rail badge
    [['hoursStatus', 'rstat'], ['railStatus', 'rail-status']].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (!el) return;
      el.classList.remove('open', 'closed');
      el.classList.add(isOpen ? 'open' : 'closed');
      el.innerHTML = '<span class="dot"></span>' + (isOpen ? msg : (pair[0] === 'railStatus' ? 'Closed' : msg));
    });

    // highlight today's row
    var listEl = document.getElementById('hoursList');
    if (listEl) listEl.querySelectorAll('li').forEach(function (li, i) { li.classList.toggle('today', i === day); });
  }
  updateHours();
  setInterval(updateHours, 60 * 1000);
})();
