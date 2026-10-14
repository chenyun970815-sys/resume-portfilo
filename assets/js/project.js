/* ============================================================
   项目详情页通用脚本（GEO / 呼叫优乐蜂 / 荷马优选）
   依赖页面内定义 window.PROJECT = { screensDir, screens[] }
   ============================================================ */
(function () {
  'use strict';
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Starfield ---------- */
  var canvas = document.getElementById('stars');
  var ctx = canvas.getContext('2d');
  var stars = [];
  function resizeStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    var n = Math.floor((canvas.width * canvas.height) / 10000);
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.55 + 0.15,
        tw: Math.random() * 0.02 + 0.004,
        ph: Math.random() * Math.PI * 2,
        cyan: Math.random() < 0.18
      });
    }
  }
  window.addEventListener('resize', resizeStars);
  resizeStars();
  /* subtle shooting stars */
  var meteors = [];
  var nextMeteorAt = performance.now() + 2500;
  function spawnMeteor(now) {
    meteors.push({
      x: canvas.width * (0.15 + Math.random() * 0.7),
      y: canvas.height * Math.random() * 0.3,
      vx: -(5 + Math.random() * 3.5),
      vy: 2.5 + Math.random() * 2,
      life: 1,
      decay: 0.011 + Math.random() * 0.008,
      cyan: Math.random() < 0.4
    });
    nextMeteorAt = now + 4500 + Math.random() * 5500;
  }
  (function drawStars() {
    var now = performance.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.ph += s.tw;
      var alpha = s.a * (0.6 + 0.4 * Math.sin(s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.cyan ? 'rgba(45,226,230,' + alpha + ')' : 'rgba(220,230,255,' + alpha + ')';
      ctx.fill();
    }
    if (now > nextMeteorAt && meteors.length < 2) spawnMeteor(now);
    for (var m = meteors.length - 1; m >= 0; m--) {
      var mt = meteors[m];
      mt.x += mt.vx;
      mt.y += mt.vy;
      mt.life -= mt.decay;
      if (mt.life <= 0 || mt.x < -80 || mt.y > canvas.height + 80) { meteors.splice(m, 1); continue; }
      var tail = 90 * mt.life;
      var grad = ctx.createLinearGradient(mt.x, mt.y, mt.x - mt.vx / 8 * tail, mt.y - mt.vy / 8 * tail);
      var head = mt.cyan ? 'rgba(45,226,230,' : 'rgba(235,242,255,';
      grad.addColorStop(0, head + (0.5 * mt.life) + ')');
      grad.addColorStop(1, head + '0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(mt.x, mt.y);
      ctx.lineTo(mt.x - mt.vx / 8 * tail, mt.y - mt.vy / 8 * tail);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mt.x, mt.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = head + (0.7 * mt.life) + ')';
      ctx.fill();
    }
    requestAnimationFrame(drawStars);
  })();

  /* ---------- Reveals ---------- */
  gsap.to('.d-hero .reveal', { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.15 });
  document.querySelectorAll('.d-sec .reveal, .d-next .reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- Hi-fi screens grid + lightbox ---------- */
  var grid = document.getElementById('screensGrid');
  if (grid && window.PROJECT && window.PROJECT.screens) {
    var html = '';
    window.PROJECT.screens.forEach(function (name) {
      var label = name.replace(/\.(jpg|jpeg|png)$/, '');
      html += '<div class="screen-cell" data-hover><img loading="lazy" src="' +
        window.PROJECT.screensDir + encodeURIComponent(name) + '" alt="' + label + '"></div>';
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.screen-cell').forEach(function (cell, i) {
      gsap.from(cell, {
        opacity: 0, y: 40, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: cell, start: 'top 94%', once: true },
        delay: (i % 6) * 0.06
      });
    });

    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<button class="lightbox-close" aria-label="关闭">✕</button><img alt="">';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img');
    grid.addEventListener('click', function (e) {
      var cell = e.target.closest('.screen-cell');
      if (!cell) return;
      lbImg.src = cell.querySelector('img').src;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox-close')) closeLb(); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---------- Smooth anchor offset ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    });
  });
})();
