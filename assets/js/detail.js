/* ============================================================
   陈云 · 项目详情页 — 交互主控（Klein 主题 · 无外部依赖）
   星野（可选）/ 滚动揭示 / 高保真界面网格 / 灯箱 / 锚点平滑滚动
   ------------------------------------------------------------
   说明：本脚本不依赖 gsap / ScrollTrigger，避免旧版依赖缺失导致
   整页脚本中断、.reveal 永久隐藏（此前 UI 详情页空白的根因）。
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var enc = function (p) { return String(p).split('/').map(encodeURIComponent).join('/'); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 星野（仅当页面存在 #stars 时启用） ---------- */
  (function initStars() {
    var canvas = $('#stars');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var stars = [], meteors = [], nextMeteorAt = performance.now() + 2500;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      var n = Math.floor((canvas.width * canvas.height) / 10000);
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.55 + 0.15,
          tw: Math.random() * 0.02 + 0.004, ph: Math.random() * Math.PI * 2,
          klein: Math.random() < 0.2
        });
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function spawn(now) {
      meteors.push({
        x: canvas.width * (0.15 + Math.random() * 0.7), y: canvas.height * Math.random() * 0.3,
        vx: -(5 + Math.random() * 3.5), vy: 2.5 + Math.random() * 2,
        life: 1, decay: 0.011 + Math.random() * 0.008, klein: Math.random() < 0.4
      });
      nextMeteorAt = now + 4500 + Math.random() * 5500;
    }

    (function draw() {
      var now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.ph += s.tw;
        var al = s.a * (0.6 + 0.4 * Math.sin(s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.klein ? 'rgba(90,97,255,' + al + ')' : 'rgba(222,228,255,' + al + ')';
        ctx.fill();
      }
      if (now > nextMeteorAt && meteors.length < 2) spawn(now);
      for (var m = meteors.length - 1; m >= 0; m--) {
        var mt = meteors[m];
        mt.x += mt.vx; mt.y += mt.vy; mt.life -= mt.decay;
        if (mt.life <= 0 || mt.x < -80 || mt.y > canvas.height + 80) { meteors.splice(m, 1); continue; }
        var tail = 90 * mt.life;
        var g = ctx.createLinearGradient(mt.x, mt.y, mt.x - mt.vx / 8 * tail, mt.y - mt.vy / 8 * tail);
        var head = mt.klein ? 'rgba(90,97,255,' : 'rgba(228,234,255,';
        g.addColorStop(0, head + (0.5 * mt.life) + ')');
        g.addColorStop(1, head + '0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(mt.x, mt.y);
        ctx.lineTo(mt.x - mt.vx / 8 * tail, mt.y - mt.vy / 8 * tail);
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    })();
  })();

  /* ---------- 滚动揭示（CSS 过渡驱动） ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el, i) { el.style.transitionDelay = (Math.min(i, 8) * 0.03) + 's'; });
    els.forEach(function (el) {
      // 首屏元素立即入场，其余进入视口再入场
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* ---------- 高保真界面网格 ---------- */
  var SCREENS = [];
  function initScreens() {
    var grid = $('#screensGrid');
    if (!grid) return;
    SCREENS = window.PROJECT_SCREENS || [];
    var html = '';
    SCREENS.forEach(function (it, i) {
      var cap = it.cap || ('界面 ' + (i + 1));
      html += '<div class="screen-cell" data-idx="' + i + '">' +
        '<img loading="lazy" src="' + enc(it.src) + '" alt="' + cap + '"></div>';
    });
    grid.innerHTML = html;
  }

  /* ---------- 灯箱 ---------- */
  function initLightbox() {
    var lb = $('#dLightbox'), grid = $('#screensGrid');
    if (!lb || !grid) return;
    var img = lb.querySelector('img');
    var cur = 0;

    var prevB = document.createElement('button');
    prevB.type = 'button'; prevB.className = 'd-lb-nav d-lb-prev';
    prevB.setAttribute('aria-label', '上一张'); prevB.innerHTML = '‹';
    var nextB = document.createElement('button');
    nextB.type = 'button'; nextB.className = 'd-lb-nav d-lb-next';
    nextB.setAttribute('aria-label', '下一张'); nextB.innerHTML = '›';
    lb.appendChild(prevB);
    lb.appendChild(nextB);

    function show(n) {
      if (!SCREENS.length) return;
      cur = (n + SCREENS.length) % SCREENS.length;
      img.src = enc(SCREENS[cur].src);
      img.alt = SCREENS[cur].cap || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    grid.addEventListener('click', function (e) {
      var cell = e.target.closest('.screen-cell');
      if (!cell) return;
      show(parseInt(cell.getAttribute('data-idx'), 10) || 0);
    });
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.d-lb-close') || e.target === lb) { close(); return; }
      if (e.target.closest('.d-lb-prev')) { show(cur - 1); return; }
      if (e.target.closest('.d-lb-next')) { show(cur + 1); return; }
      var r = lb.getBoundingClientRect();
      if (e.clientX - r.left < r.width * 0.22) show(cur - 1);
      else if (e.clientX - r.left > r.width * 0.78) show(cur + 1);
      else close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---------- 锚点平滑滚动（补偿固定导航高度） ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 74, behavior: 'smooth' });
      });
    });
  }

  function boot() {
    initScreens();
    initReveal();
    initLightbox();
    initAnchors();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
