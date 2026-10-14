/* ============================================================
   陈云 · 新媒体运营作品集 — interactions
   ============================================================ */
(function () {
  'use strict';

  // encode a path segment-wise (handles Chinese / spaces / @)
  var enc = function (p) {
    return p.split('/').map(function (s) { return encodeURIComponent(s); }).join('/');
  };

  /* ---------- 1. 海报设计（按实际尺寸，不裁切） ---------- */
  var posterCats = [
    { head: '海报设计', items: [1, 2, 3, 4].map(function (i) { return { src: 'assets/graphic/poster-' + i + '.png', cap: '海报设计 · P' + i }; }) }
  ];

  /* ---------- 2. 其余平面设计 ---------- */
  var graphicCats = [
    { head: 'Logo 设计', items: [1, 2, 3].map(function (i) { return { src: 'assets/graphic/logo-' + i + '.png', cap: 'Logo 设计' }; }) },
    { head: '活动物料', items: [1, 2, 3, 4].map(function (i) { return { src: 'assets/graphic/material-' + i + '.png', cap: '活动物料' }; }) },
    { head: '展陈物料', items: [1, 2, 3, 4].map(function (i) { return { src: 'assets/graphic/zhanjia-' + i + '.png', cap: '展陈物料' }; }) },
    { head: '品牌 VI 手册', items: (function () { var a = []; for (var i = 1; i <= 10; i++) { a.push({ src: 'assets/graphic/vi-' + (i < 10 ? '0' : '') + i + '.jpg', cap: '品牌 VI 手册 · P' + i }); } return a; })() }
  ];

  /* ---------- 3. 视频剪辑（内联播放器） ---------- */
  var videos = [
    { src: 'assets/video/video-values.mp4', poster: 'assets/video/posters/video-values.jpg', cap: '价值观与行为准则创意视频', sub: '企业宣传短片 · 剪辑 / 包装' },
    { src: 'assets/video/video-system.mp4', poster: 'assets/video/posters/video-system.jpg', cap: '固废管理系统介绍', sub: '产品 / 系统介绍 · 剪辑' },
    { src: 'assets/video/video-history.mp4', poster: 'assets/video/posters/video-history.jpg', cap: '公司历程视频', sub: '企业历程 · 剪辑包装' },
    { src: 'assets/video/video-anniversary.mp4', poster: 'assets/video/posters/video-anniversary.jpg', cap: '高尔夫七周年庆典', sub: '周年庆宣传片 · 剪辑' }
  ];

  /* ---------- 4. UI 设计（跳转详情页） ---------- */
  var uiProjects = [
    { key: 'geo', tag: 'AI / SaaS · 产品 + UI', title: 'GEO 品牌可见度优化平台', cover: 'assets/covers/project-geo.png',
      desc: '面向中小企业及代理商的品牌 AI 可见度优化 SaaS：关键词管理、AI 内容生成、多平台分发、AI 可见度监测与效果报告。', href: 'ui-geo.html' },
    { key: 'call', tag: 'B 端小程序 · 三端协同', title: '呼叫优乐蜂', cover: 'assets/covers/project-call.png',
      desc: '危废清运全链路数字化管理平台，产废单位小程序 + 收集单位系统 + 物流端小程序三端协同，已上线。', href: 'ui-call.html' },
    { key: 'hemayou', tag: 'C 端小程序 · 亲子营地教育', title: '荷马优选', cover: 'assets/covers/project-hemayou.png',
      desc: '面向 5-12 岁亲子家庭的营地教育一站式平台，内容发现 → 下单消费 → 分享裂变 → 团队定制完整闭环。', href: 'ui-hemayou.html' },
    { key: 'qingwow', tag: 'C 端 APP · 健身电商', title: '轻 WOW 健身商城', cover: 'assets/covers/project-qingwow.png',
      desc: '运动健身 + 健康消费一体化生活方式 APP，移动减脂私教 + 运动好物推荐官，运动还能领现金红包。', href: 'ui-qingwow.html' }
  ];

  /* ---------- 5. 动态表情包（gif 自动播放） ---------- */
  var stickers = [
    '求带', '新年快乐', '谢谢老板', '开会', '新年好', '送你花花', '比心', '收到', '加急中', '晚安',
    '惊吓', '在线等', '节日快乐', '哈哈哈', '看好你哦', '谢谢', '不错不错', '忙忙忙', '拜拜', '疑问',
    '戴好口罩', '霸气', '不不不', '拜年啦', '钱来', '月底了', '着急', '调皮', '嗨', 'emo',
    '下班啦', '淡定', '达成共识', '开心到飞起', '早安', '没问题', '客气啦', '赞大拇指', '加油'
  ];

  // groups that the lightbox navigates within (images only)
  var groups = {};

  function buildPoster(id, cats) {
    var box = document.getElementById(id);
    if (!box) return;
    var all = [];
    cats.forEach(function (cat) {
      var h = document.createElement('div');
      h.className = 'album-head reveal';
      h.textContent = cat.head;
      box.appendChild(h);
      cat.items.forEach(function (it) {
        var cell = document.createElement('div');
        cell.className = 'ph ph-natural reveal';
        cell.setAttribute('data-cap', it.cap);
        cell.innerHTML = '<img loading="lazy" src="' + enc(it.src) + '" alt="' + it.cap + '">';
        box.appendChild(cell);
        all.push({ type: 'img', src: it.src, cap: it.cap });
      });
    });
    groups[id] = all;
  }

  function buildAlbum(id, cats) {
    var box = document.getElementById(id);
    if (!box) return;
    var all = [];
    cats.forEach(function (cat) {
      var h = document.createElement('div');
      h.className = 'album-head reveal';
      h.textContent = cat.head;
      box.appendChild(h);
      cat.items.forEach(function (it) {
        var cell = document.createElement('div');
        cell.className = 'ph reveal';
        cell.setAttribute('data-cap', it.cap);
        cell.innerHTML = '<img loading="lazy" src="' + enc(it.src) + '" alt="' + it.cap + '">';
        box.appendChild(cell);
        all.push({ type: 'img', src: it.src, cap: it.cap });
      });
    });
    groups[id] = all;
  }

  function buildVideos(id, list) {
    var box = document.getElementById(id);
    if (!box) return;
    var all = [];
    list.forEach(function (v) {
      var card = document.createElement('article');
      card.className = 'vcard reveal';
      card.innerHTML =
        '<video class="vplayer" src="' + enc(v.src) + '" poster="' + enc(v.poster) + '" preload="metadata" controls playsinline></video>' +
        '<button class="v-expand" type="button" aria-label="放大播放" data-idx="' + all.length + '">&#9974;</button>' +
        '<div class="vcard-info"><h4>' + v.cap + '</h4><span>' + v.sub + '</span></div>';
      box.appendChild(card);
      all.push({ type: 'video', src: v.src, poster: v.poster, cap: v.cap, sub: v.sub });
    });
    groups[id] = all;
  }

  function buildUI(id, list) {
    var box = document.getElementById(id);
    if (!box) return;
    list.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'uicard reveal';
      a.href = p.href;
      a.innerHTML =
        '<div class="uicard-media"><span class="uicard-tag">' + p.tag + '</span>' +
        '<img loading="lazy" src="' + enc(p.cover) + '" alt="' + p.title + '"></div>' +
        '<div class="uicard-body"><h3>' + p.title + '</h3><p>' + p.desc + '</p>' +
        '<span class="uicard-more">查看完整案例 <i>&rarr;</i></span></div>';
      box.appendChild(a);
    });
  }

  function buildStickers(id, list) {
    var box = document.getElementById(id);
    if (!box) return;
    var all = [];
    list.forEach(function (name) {
      var cell = document.createElement('div');
      cell.className = 'sticker reveal';
      var src = 'assets/stickers/' + name + '.gif';
      cell.innerHTML = '<img loading="lazy" src="' + enc(src) + '" alt="' + name + '"><span class="sticker-cap">' + name + '</span>';
      box.appendChild(cell);
      all.push({ type: 'img', src: src, cap: name });
    });
    groups[id] = all;
  }

  buildPoster('albumPoster', posterCats);
  buildAlbum('albumGraphic', graphicCats);
  buildVideos('videoGrid', videos);
  buildUI('albumUI', uiProjects);
  buildStickers('stickerGrid', stickers);

  /* ---------- 5. Lightbox (images only) ---------- */
  var lb = document.getElementById('lightbox');
  var lbStage = document.getElementById('lbStage');
  var lbCounter = document.getElementById('lbCounter');
  var currentGroup = null, currentIdx = 0;

  function showInLB() {
    if (!currentGroup) return;
    var item = currentGroup[currentIdx];
    lbStage.innerHTML = '';
    if (item.type === 'video') {
      var vid = document.createElement('video');
      vid.src = enc(item.src);
      vid.poster = enc(item.poster);
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.className = 'lb-video';
      lbStage.appendChild(vid);
      if (item.cap) {
        var cap = document.createElement('figcaption');
        cap.className = 'lb-cap';
        cap.textContent = item.cap;
        lbStage.appendChild(cap);
      }
      var pr = vid.play();
      if (pr && pr.catch) pr.catch(function () {});
    } else {
      var img = document.createElement('img');
      img.src = enc(item.src);
      img.alt = item.cap;
      lbStage.appendChild(img);
    }
    lbCounter.textContent = (currentIdx + 1) + ' / ' + currentGroup.length;
  }
  function openLB(groupId, idx) {
    currentGroup = groups[groupId]; currentIdx = idx;
    lb.classList.add('active'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showInLB();
  }
  function closeLB() {
    lb.classList.remove('active'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbStage.innerHTML = '';
  }
  function navLB(d) {
    if (!currentGroup) return;
    currentIdx = (currentIdx + d + currentGroup.length) % currentGroup.length;
    showInLB();
  }

  ['albumPoster', 'albumGraphic'].forEach(function (gid) {
    var box = document.getElementById(gid);
    if (!box) return;
    box.addEventListener('click', function (e) {
      var cell = e.target.closest('.ph');
      if (!cell) return;
      var idx = Array.prototype.indexOf.call(box.querySelectorAll('.ph'), cell);
      openLB(gid, idx);
    });
  });

  (function () {
    var box = document.getElementById('stickerGrid');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var cell = e.target.closest('.sticker');
      if (!cell) return;
      var idx = Array.prototype.indexOf.call(box.querySelectorAll('.sticker'), cell);
      openLB('stickerGrid', idx);
    });
  })();

  (function () {
    var box = document.getElementById('videoGrid');
    if (!box) return;
    box.addEventListener('click', function (e) {
      var btn = e.target.closest('.v-expand');
      if (!btn) return;
      var idx = parseInt(btn.getAttribute('data-idx'), 10) || 0;
      openLB('videoGrid', idx);
    });
  })();

  document.getElementById('lbClose').addEventListener('click', closeLB);
  document.getElementById('lbPrev').addEventListener('click', function () { navLB(-1); });
  document.getElementById('lbNext').addEventListener('click', function () { navLB(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') navLB(-1);
    if (e.key === 'ArrowRight') navLB(1);
  });

  /* ---------- 6. Scroll reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  function observeReveals() {
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { io.observe(el); });
  }
  observeReveals();

  /* ---------- 7. Count-up stats ---------- */
  var counted = false;
  function runCounts() {
    if (counted) return; counted = true;
    document.querySelectorAll('.count').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-to'));
      var suffix = el.getAttribute('data-suffix') || '';
      var start = null, dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * to) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var heroIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { runCounts(); heroIO.disconnect(); } });
  }, { threshold: 0.3 });
  var heroSec = document.getElementById('hero');
  if (heroSec) heroIO.observe(heroSec);

  /* ---------- 8. Nav + progress ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('scrollProgress');
  var navLinks = document.getElementById('navLinks');
  var navToggle = document.getElementById('navToggle');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('scrolled', y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  navToggle.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });

  // smooth anchor offset for fixed nav
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
