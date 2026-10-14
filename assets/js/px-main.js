/* ============================================================
   陈云 · 作品集 V2 — 交互主控
   加载器 / 文字揭示 / 平滑滚动 / 门户线稿切换 / 视窗轮播 /
   横向滚动 / 网格视差 / 灯箱 / 菜单 / 自定义光标
   ============================================================ */
(function () {
  'use strict';

  var enc = function (p) { return p.split('/').map(encodeURIComponent).join('/'); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     0. 内容数据
     --------------------------------------------------------- */
  /* 品牌画册：书架 + 翻页（页数与跨页比例对齐实际图片） */
  var ALBUMS = {
    youlefeng: { prefix: 'youlefeng', pages: 20, name: '优乐蜂画册', spread: '1190/807' },
    hema:      { prefix: 'hema',      pages: 28, name: '荷马企业画册', spread: '2/1' },
    changtian: { prefix: 'changtian', pages: 16, name: '长天快运画册', spread: '1190/807' },
    chengwen:  { prefix: 'chengwen',  pages: 36, name: '成文画册', spread: '2/1' }
  };

  var FRAME_SHOTS = [
    { src: 'assets/graphic/zhanjia-3.png',  t: '共赴 7 迹 · 挥杆致远', s: '平面设计 · 周年庆典主视觉', fit: 'cover' },
    { src: 'assets/graphic/vi-02.jpg',      t: '品牌 VI 手册',        s: '平面设计 · 视觉识别系统', fit: 'cover' },
    { src: 'assets/graphic/poster-1.png',   t: '高尔夫赛事主视觉',    s: '平面设计 · 海报',        fit: 'contain' },
    { src: 'assets/graphic/material-1.png', t: '吉祥物表情包',        s: '品牌 IP · 周边物料',      fit: 'cover' },
    { src: 'assets/graphic/zhanjia-2.png',  t: '球会邀请视觉',        s: '平面设计 · 活动物料',     fit: 'cover' },
    { src: 'assets/graphic/material-4.png', t: '企业台历设计',        s: '平面设计 · 印刷周边',     fit: 'cover' },
    { src: 'assets/graphic/poster-3.png',   t: '月例赛海报',          s: '平面设计 · 活动海报',     fit: 'contain' },
    { src: 'assets/graphic/zhanjia-1.png',  t: '展陈装置视觉',        s: '平面设计 · 展陈',         fit: 'cover' }
  ];

  var PORTAL_ITEMS = [
    { src: 'assets/graphic/zhanjia-3.png',  t: '周年庆典主视觉', m: '平面设计 · 主视觉' },
    { src: 'assets/graphic/material-1.png', t: '吉祥物表情包',   m: '品牌 IP · 周边物料' },
    { src: 'assets/graphic/vi-02.jpg',      t: '品牌 VI 手册',   m: '平面设计 · VI 系统' },
    { src: 'assets/graphic/zhanjia-2.png',  t: '球会邀请视觉',   m: '平面设计 · 活动物料' },
    { src: 'assets/graphic/material-4.png', t: '企业台历设计',   m: '平面设计 · 印刷周边' },
    { src: 'assets/graphic/zhanjia-1.png',  t: '展陈装置视觉',   m: '平面设计 · 展陈' },
    { src: 'assets/graphic/poster-3.png',   t: '月例赛海报',     m: '平面设计 · 海报' }
  ];

  var GRAPHIC_CATS = [
    { head: '海报设计', cls: '', cols: 4, items: [1, 2, 3, 4].map(function (i) {
        return { src: 'assets/graphic/poster-' + i + '.png', cap: '海报设计 · P' + i }; }) },
    { head: 'Logo 设计', cls: '', cols: 3, items: [1, 2, 3].map(function (i) {
        return { src: 'assets/graphic/logo-' + i + '.png', cap: 'Logo 设计' }; }) },
    { head: '活动物料', cls: '', cols: 4, items: [1, 2, 3, 4].map(function (i) {
        return { src: 'assets/graphic/material-' + i + '.png', cap: '活动物料' }; }) },
    { head: '展陈物料', cls: '', cols: 2, items: [1, 2, 3, 4].map(function (i) {
        return { src: 'assets/graphic/zhanjia-' + i + '.png', cap: '展陈物料' }; }) }
  ];

  /* 品牌 VI 手册：独立 10 页网格，点击放大 + 左右切换（照搬参考站 VI 板块） */
  var VI_PAGES = (function () {
    var a = [];
    for (var i = 1; i <= 10; i++) {
      a.push({ src: 'assets/graphic/vi-' + (i < 10 ? '0' + i : i) + '.jpg', cap: '品牌 VI 手册 · 第 ' + i + ' 页' });
    }
    return a;
  })();

  var VIDEOS = [
    { src: 'assets/video/video-values.mp4',      poster: 'assets/video/posters/video-values.jpg',      cap: '价值观与行为准则创意视频', sub: '企业宣传短片 · 剪辑 / 包装' },
    { src: 'assets/video/video-system.mp4',      poster: 'assets/video/posters/video-system.jpg',      cap: '固废管理系统介绍',         sub: '产品 / 系统介绍 · 剪辑' },
    { src: 'assets/video/video-history.mp4',     poster: 'assets/video/posters/video-history.jpg',     cap: '公司历程视频',             sub: '企业历程 · 剪辑包装' },
    { src: 'assets/video/video-anniversary.mp4', poster: 'assets/video/posters/video-anniversary.jpg', cap: '高尔夫七周年庆典',         sub: '周年庆宣传片 · 剪辑' }
  ];

  /* 直观的成果：替代原「核心能力」四项文字介绍，以成果卡片形式呈现 */
  var RESULTS = [
    { tag: '宣传短片',   title: '活动纪实视频',       desc: '独立完成 7 场大型活动宣传短片的拍摄协作、剪辑与包装。',               href: '#video' },
    { tag: '原创 IP',    title: '企业吉祥物「蜂蜂」', desc: '输出 36+ 款动态表情包与周边物料，让环保品牌有了可亲近的人格。',       href: '#ip' },
    { tag: '品牌画册',   title: '成文留学画册',       desc: '活动物料、海报、宣传画册与 PPT 全案输出，36P 品牌叙事。',             href: '#works' },
    { tag: 'B 端小程序', title: '呼叫优乐蜂',         desc: '危废清运预约平台，扫码即运、合同可视，覆盖 1300+ 家企业。',           href: '#ui' },
    { tag: '品牌官网',   title: '优乐蜂环保官网',     desc: '从 0 到 1 完成需求分析、原型设计、UI 实现与上线跟进的品牌展示官网。', href: '#ui' },
    { tag: 'C 端小程序', title: '荷马优选',           desc: '亲子营地教育电商，负责整体视觉定义、交互优化与 VI 规范。',           href: '#ui' }
  ];

  var UI_PROJECTS = [
    { tag: 'C 端 APP · 健身电商', title: '轻 WOW 健身商城', cover: 'assets/covers/project-qingwow.png',
      desc: '运动健身 + 健康消费一体化 APP，数据追踪、饮食方案、社区激励与运动电商闭环。', href: 'ui-qingwow.html' },
    { tag: 'G 端监管 · Web 后台', title: '宜兴环境管理标准化系统', cover: 'assets/covers/project-yixing.png',
      desc: '无锡市首个危废全流程智慧化管理系统，覆盖 PC 后台、企业自查与小程序多端协同。', href: 'ui-yixing.html' },
    { tag: 'B 端小程序 · 三端协同', title: '呼叫优乐蜂', cover: 'assets/covers/project-call.png',
      desc: '危废清运全链路数字化管理平台，产废单位小程序 + 收集单位系统 + 物流端小程序三端协同，已上线。', href: 'ui-call.html' },
    { tag: 'C 端小程序 · 亲子教育', title: '荷马优选', cover: 'assets/covers/project-hemayou.png',
      desc: '亲子营地教育电商平台，负责整体视觉风格定义、交互优化与 VI 规范，形成完整服务闭环。', href: 'ui-hemayou.html' },
    { tag: 'AI / SaaS · 产品 + UI', title: 'GEO 品牌可见度优化平台', cover: 'assets/covers/project-geo.png',
      desc: '基于 Vibe Coding 完成的 AI 搜索排名优化 SaaS：关键词管理、AI 内容生成、多平台分发与排名监测。', href: 'ui-geo.html' },
    { tag: '企业官网 · 0→1 落地', title: '优乐蜂环保官网', cover: 'assets/covers/project-unicle.png',
      desc: '从 0 到 1 完成需求分析、原型设计、UI 实现及上线跟进的品牌展示官网。', href: 'https://www.unicle.com.cn/', ext: true }
  ];

  var STICKERS = ['求带','新年快乐','谢谢老板','开会','新年好','送你花花','比心','收到','加急中','晚安',
    '惊吓','在线等','节日快乐','哈哈哈','谢谢','不错不错','忙忙忙','拜拜','疑问',
    '戴好口罩','霸气','不不不','拜年啦','钱来','月底了','着急','调皮','嗨','emo',
    '下班啦','淡定','达成共识','开心到飞起','早安','没问题','客气啦','赞大拇指','加油'];

  var groups = {};

  /* ---------------------------------------------------------
     1. 构建内容 DOM
     --------------------------------------------------------- */
  function buildAlbum() {
    var box = $('#albumGraphic'); if (!box) return;
    var all = [];
    GRAPHIC_CATS.forEach(function (cat) {
      var h = document.createElement('div');
      h.className = 'album-head'; h.textContent = cat.head;
      box.appendChild(h);
      cat.items.forEach(function (it) {
        var cell = document.createElement('div');
        cell.className = 'ph ' + cat.cls + ' cols-' + cat.cols;
        cell.setAttribute('data-cap', it.cap);
        cell.innerHTML = '<img loading="lazy" src="' + enc(it.src) + '" alt="' + it.cap + '">';
        box.appendChild(cell);
        all.push({ type: 'img', src: it.src, cap: it.cap });
      });
    });
    groups.albumGraphic = all;
  }

  function buildVI() {
    var box = $('#viGrid'); if (!box) return;
    var all = [];
    VI_PAGES.forEach(function (it) {
      var cell = document.createElement('div');
      cell.className = 'vi-cell';
      cell.setAttribute('data-cap', it.cap);
      cell.innerHTML = '<img loading="lazy" src="' + enc(it.src) + '" alt="' + it.cap + '">';
      box.appendChild(cell);
      all.push({ type: 'img', src: it.src, cap: it.cap });
    });
    groups.viGrid = all;
  }

  /* 表情包：错落马赛克墙（有大有小 —— 照搬参考站贴纸墙） */
  var STICKER_PATTERN = ['B', '.', '.', 'W', '.', '.', '.', 'B', '.', 'W', '.', '.', '.', '.', 'W', '.', 'B', '.', '.', 'W', '.', '.', '.', 'B', '.', '.', 'W', '.', '.', '.', 'B', '.', 'W', '.', '.', '.', '.', 'W', '.'];

  function buildStickers() {
    var box = $('#stickerGrid'); if (!box) return;
    var all = [];
    STICKERS.forEach(function (name, i) {
      var size = STICKER_PATTERN[i % STICKER_PATTERN.length];
      var cell = document.createElement('div');
      cell.className = 'sm-tile ' + (size === 'B' ? 'sm-big' : (size === 'W' ? 'sm-wide' : '')) + ' sm-c' + ((i % 6) + 1);
      cell.setAttribute('data-cap', name);
      var src = 'assets/stickers/' + name + '.gif';
      cell.innerHTML = '<img loading="lazy" src="' + enc(src) + '" alt="表情包 ' + name + '">';
      box.appendChild(cell);
      all.push({ type: 'img', src: src, cap: name });
    });
    groups.stickerGrid = all;
  }

  function buildVideos() {
    var box = $('#videoGrid'); if (!box) return;
    var all = [];
    VIDEOS.forEach(function (v, i) {
      var card = document.createElement('article');
      card.className = 'vcard';
      card.setAttribute('data-idx', i);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', '放大播放：' + v.cap);
      card.innerHTML =
        '<video class="vplayer" src="' + enc(v.src) + '" poster="' + enc(v.poster) + '" preload="metadata" muted playsinline></video>' +
        '<span class="vcard-play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' +
        '<div class="vcard-info"><h4>' + v.cap + '</h4><span>' + v.sub + '</span></div>';
      box.appendChild(card);
      all.push({ type: 'video', src: v.src, poster: v.poster, cap: v.cap, sub: v.sub });
    });
    groups.videoGrid = all;
  }

  function buildUI() {
    var box = $('#albumUI'); if (!box) return;
    UI_PROJECTS.forEach(function (p, i) {
      var a = document.createElement('a');
      a.className = 'uicard'; a.href = p.href;
      a.setAttribute('data-rv', '');
      a.style.transitionDelay = ((i % 3) * 0.07) + 's';
      if (p.ext) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML =
        '<div class="uicard-media"><span class="uicard-tag">' + p.tag + '</span>' +
        '<img loading="lazy" src="' + enc(p.cover) + '" alt="' + p.title + '"></div>' +
        '<div class="uicard-body"><h3>' + p.title + '</h3><p>' + p.desc + '</p>' +
        '<span class="uicard-more">' + (p.ext ? '访问线上项目' : '查看完整案例') + ' <i>→</i></span></div>';
      box.appendChild(a);
    });
  }

  /* 直观的成果：替代原「核心能力」四项文字介绍，以成果卡片形式呈现 */
  function buildResults() {
    var box = $('#resultsGrid'); if (!box) return;
    RESULTS.forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'r-card'; a.href = r.href || '#';
      a.setAttribute('data-rv', '');
      a.innerHTML =
        '<span class="r-tag">' + r.tag + '</span>' +
        '<h3 class="r-title">' + r.title + '</h3>' +
        '<p class="r-desc">' + r.desc + '</p>' +
        '<span class="r-more">查看 <i>→</i></span>';
      box.appendChild(a);
    });
  }

  /* ---------------------------------------------------------
     1b. 品牌画册 · 书架 + 翻页弹窗（照搬参考站「品牌画册设计」效果）
     --------------------------------------------------------- */
  var albumState = { key: null, flipped: 0, sheets: [], timer: null, auto: true };

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function buildBook(key) {
    var alb = ALBUMS[key];
    var book = $('#book'); if (!book || !alb) return;
    book.innerHTML = '';
    albumState.sheets = [];
    albumState.flipped = 0;

    var baseL = document.createElement('div');
    baseL.className = 'bpage-base base-left';
    baseL.innerHTML = '<span>BRAND<br>ALBUM</span><em>' + alb.name + '</em>';
    var baseR = document.createElement('div');
    baseR.className = 'bpage-base base-right';
    baseR.innerHTML = '<span>THANKS<br>FOR READING</span><em>陈云 · 品牌画册设计</em>';
    book.appendChild(baseL);
    book.appendChild(baseR);

    var sheets = Math.ceil(alb.pages / 2);
    for (var i = 1; i <= sheets; i++) {
      var pf = 2 * i - 1, pb = 2 * i;
      var sheet = document.createElement('div');
      sheet.className = 'bpage';
      sheet.style.zIndex = sheets - i + 2;
      sheet.dataset.z = sheets - i + 2;
      var front = document.createElement('div');
      front.className = 'face front';
      front.innerHTML = pf <= alb.pages ? '<img src="' + enc('assets/albums/' + alb.prefix + '-' + pad2(pf) + '.jpg') + '" alt="' + alb.name + ' 第' + pf + ' 页">' : '';
      var back = document.createElement('div');
      back.className = 'face back';
      back.innerHTML = pb <= alb.pages ? '<img src="' + enc('assets/albums/' + alb.prefix + '-' + pad2(pb) + '.jpg') + '" alt="' + alb.name + ' 第' + pb + ' 页">' : '';
      sheet.appendChild(front);
      sheet.appendChild(back);
      book.appendChild(sheet);
      albumState.sheets.push(sheet);
    }
    updateBookUI();
  }

  function updateBookUI() {
    var alb = ALBUMS[albumState.key]; if (!alb) return;
    var pageEl = $('#bookPage'), progEl = $('#bookProgress');
    var prevBtn = $('#flipPrev'), nextBtn = $('#flipNext');
    var shown = Math.min(albumState.flipped * 2 + 1, alb.pages);
    if (pageEl) pageEl.textContent = pad2(shown) + ' / ' + pad2(alb.pages);
    if (progEl) progEl.style.width = (albumState.flipped / albumState.sheets.length * 100) + '%';
    if (prevBtn) prevBtn.disabled = albumState.flipped === 0;
    if (nextBtn) nextBtn.disabled = albumState.flipped >= albumState.sheets.length;
  }

  function flipNext() {
    if (albumState.flipped >= albumState.sheets.length) { stopAuto(); return; }
    var sheet = albumState.sheets[albumState.flipped];
    albumState.flipped++;
    sheet.style.zIndex = albumState.sheets.length + albumState.flipped + 2;
    if (window.gsap) gsap.to(sheet, { rotationY: -180, duration: 0.9, ease: 'power2.inOut' });
    else sheet.style.transform = 'rotateY(-180deg)';
    updateBookUI();
    if (albumState.flipped >= albumState.sheets.length) stopAuto();
  }

  function flipPrev() {
    if (albumState.flipped <= 0) return;
    albumState.flipped--;
    var sheet = albumState.sheets[albumState.flipped];
    if (window.gsap) {
      gsap.to(sheet, { rotationY: 0, duration: 0.9, ease: 'power2.inOut',
        onComplete: function () { sheet.style.zIndex = sheet.dataset.z; } });
    } else {
      sheet.style.transform = 'rotateY(0deg)';
      sheet.style.zIndex = sheet.dataset.z;
    }
    updateBookUI();
  }

  function startAuto() {
    stopAuto();
    albumState.auto = true;
    var b = $('#flipAuto');
    if (b) { b.textContent = '暂停自动翻页'; b.classList.remove('paused'); }
    albumState.timer = setInterval(flipNext, 2600);
  }
  function stopAuto() {
    albumState.auto = false;
    if (albumState.timer) { clearInterval(albumState.timer); albumState.timer = null; }
    var b = $('#flipAuto');
    if (b) { b.textContent = '继续自动翻页'; b.classList.add('paused'); }
  }

  function openFlipbook(key) {
    if (!ALBUMS[key]) return;
    albumState.key = key;
    var fb = $('#flipbook'); if (!fb) return;
    var title = $('#flipTitle'); if (title) title.textContent = ALBUMS[key].name;
    var mBook = $('.modal-book');
    if (mBook) mBook.style.aspectRatio = ALBUMS[key].spread;
    buildBook(key);
    fb.classList.add('open');
    fb.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('is-locked');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    startAuto();
  }
  function closeFlipbook() {
    stopAuto();
    var fb = $('#flipbook'); if (!fb) return;
    fb.classList.remove('open');
    fb.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('is-locked');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  function initFlipbook() {
    var shelf = $('#shelf'), fb = $('#flipbook'); if (!shelf || !fb) return;
    shelf.addEventListener('click', function (e) {
      var btn = e.target.closest('.sbook');
      if (btn) openFlipbook(btn.getAttribute('data-album'));
    });
    var prevBtn = $('#flipPrev'), nextBtn = $('#flipNext'), autoBtn = $('#flipAuto');
    if (nextBtn) nextBtn.addEventListener('click', function () { stopAuto(); flipNext(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { stopAuto(); flipPrev(); });
    if (autoBtn) autoBtn.addEventListener('click', function () { albumState.auto ? stopAuto() : startAuto(); });
    var closeBtn = $('#flipClose');
    if (closeBtn) closeBtn.addEventListener('click', closeFlipbook);
    var bd = fb.querySelector('[data-flip-close]');
    if (bd) bd.addEventListener('click', closeFlipbook);
    var book = $('#book');
    if (book) book.addEventListener('click', function (e) {
      var r = book.getBoundingClientRect();
      stopAuto();
      if (e.clientX - r.left < r.width / 2) flipPrev(); else flipNext();
    });
    document.addEventListener('keydown', function (e) {
      if (!fb.classList.contains('open')) return;
      if (e.key === 'Escape') closeFlipbook();
      if (e.key === 'ArrowRight') { stopAuto(); flipNext(); }
      if (e.key === 'ArrowLeft') { stopAuto(); flipPrev(); }
    });
  }

  /* ---------------------------------------------------------
     2. 加载器
     --------------------------------------------------------- */
  function initLoader() {
    var digits = $$('[data-digit]');
    var loader = $('#loader');
    var val = 0, done = false;

    window.addEventListener('load', function () { done = true; });
    setTimeout(function () { done = true; }, 4200);

    function paint(n) {
      var s = ('00' + Math.min(100, Math.floor(n))).slice(-3);
      digits.forEach(function (d, i) { d.textContent = s[i]; });
      $$('.loader-digit svg path').forEach(function (p, i) {
        p.style.strokeDashoffset = Math.max(0, 1 - (n / 100) * 1.15 + i * 0.05);
      });
    }

    (function tick() {
      var target = done ? 100 : 92;
      val += (target - val) * (done ? 0.16 : 0.045) + 0.28;
      if (val >= 99.6 && done) {
        paint(100);
        setTimeout(finish, 340);
        return;
      }
      paint(val);
      requestAnimationFrame(tick);
    })();

    function finish() {
      document.documentElement.classList.add('ready');
      document.documentElement.classList.remove('is-loading');
      document.documentElement.classList.add('scene-ready');
      if (loader) setTimeout(function () { loader.style.display = 'none'; }, 700);
      if (window.__pxPlayIntro) window.__pxPlayIntro();
      playHeroIntro();
    }
  }

  function playHeroIntro() {
    $$('.hero .rv').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-in'); }, 90 * i);
    });
    $$('.hero [data-rv]').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-in'); }, 120 * i);
    });
    var h1 = $('.hero-h1');
    if (h1) $$('.rv', h1).forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     3. 进入视口揭示
     --------------------------------------------------------- */
  function initReveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

    $$('.rv:not(.is-in)').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
    $$('[data-rv]:not(.is-in)').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
  }

  /* ---------------------------------------------------------
     4. 数字滚动
     --------------------------------------------------------- */
  function initCounts() {
    var played = false;
    function run() {
      if (played) return; played = true;
      $$('.count').forEach(function (el) {
        var to = parseFloat(el.getAttribute('data-to'));
        var suffix = el.getAttribute('data-suffix') || '';
        if (window.gsap) {
          var o = { v: 0 };
          gsap.to(o, { v: to, duration: 1.5, ease: 'power3.out',
            onUpdate: function () { el.textContent = Math.round(o.v) + suffix; } });
        } else {
          el.textContent = to + suffix;
        }
      });
    }
    var hero = $('.hero');
    if (!hero) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { setTimeout(run, 900); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(hero);
  }

  /* ---------------------------------------------------------
     5. 平滑滚动 + 网格视差
     --------------------------------------------------------- */
  var lenis = null;
  function initSmooth() {
    var grid = $('#bgGrid');
    if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    if (window.Lenis && !reduced) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
      window.__lenis = lenis;
    }

    window.addEventListener('scroll', function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (grid) grid.style.setProperty('--grid-y', (-y * 0.16) + 'px');
    }, { passive: true });
  }

  function scrollToTarget(sel) {
    var t = $(sel); if (!t) return;
    var y = t.getBoundingClientRect().top + (window.scrollY || 0) - 8;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  /* ---------------------------------------------------------
     6. 自定义光标
     --------------------------------------------------------- */
  function initCursor() {
    var c = $('#cursor'); if (!c) return;
    var x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
    }, { passive: true });
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%) scale(' + (c.classList.contains('on') ? 1 : 0) + ')';
      requestAnimationFrame(loop);
    })();
    $$('.portal, .frame').forEach(function (el) {
      el.addEventListener('mouseenter', function () { c.classList.add('on'); });
      el.addEventListener('mouseleave', function () { c.classList.remove('on'); });
    });
  }

  /* ---------------------------------------------------------
     7. 菜单
     --------------------------------------------------------- */
  function initMenu() {
    var btn = $('#menuToggle'), panel = $('#menuPanel');
    if (!btn || !panel) return;
    function toggle(open) {
      var want = open === undefined ? !document.documentElement.classList.contains('menu-open') : open;
      document.documentElement.classList.toggle('menu-open', want);
      btn.setAttribute('aria-expanded', String(want));
      panel.setAttribute('aria-hidden', String(!want));
      var i = $$('.roll i', btn); if (i.length === 2) {
        i[0].style.transform = want ? 'translateY(-120%)' : '';
        i[1].style.transform = want ? 'translateY(0)' : '';
      }
      if (lenis) want ? lenis.stop() : lenis.start();
      document.documentElement.classList.toggle('is-locked', want);
    }
    btn.addEventListener('click', function () { toggle(); });
    $$('.menu-list a', panel).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        toggle(false);
        setTimeout(function () { scrollToTarget(a.getAttribute('href')); }, 520);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
  }

  /* ---------------------------------------------------------
     8. 门户矩形：自动轮播 + 鼠标切换线稿
     --------------------------------------------------------- */
  function initPortal() {
    var portal = $('#portal'); if (!portal) return;
    var photo = $('[data-portal-photo]'), line = $('[data-portal-line]');
    var meta = $('[data-portal-meta]'), title = $('[data-portal-title]'), dots = $('[data-portal-dots]');
    var i = 0, timer = null;

    PORTAL_ITEMS.forEach(function () { dots.appendChild(document.createElement('i')); });
    var dotEls = $$('i', dots);

    function show(n) {
      i = (n + PORTAL_ITEMS.length) % PORTAL_ITEMS.length;
      var it = PORTAL_ITEMS[i];
      var url = 'url("' + enc(it.src) + '")';
      [photo, line].forEach(function (el) { el.style.backgroundImage = url; });
      photo.style.opacity = portal.classList.contains('is-hover') ? 0 : 1;
      line.style.opacity = portal.classList.contains('is-hover') ? 1 : 0;
      photo.classList.add('on'); line.classList.add('on');
      meta.textContent = it.m; title.textContent = it.t;
      dotEls.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    function start() { if (!timer) timer = setInterval(function () { show(i + 1); }, 3800); }
    function stop() { clearInterval(timer); timer = null; }

    show(0); start();

    function enter() {
      portal.classList.add('is-hover');
      photo.style.opacity = 0; line.style.opacity = 1;
    }
    function leave() {
      portal.classList.remove('is-hover');
      photo.style.opacity = 1; line.style.opacity = 0;
    }
    ['mouseenter', 'pointerenter', 'mouseover'].forEach(function (ev) {
      portal.addEventListener(ev, enter);
    });
    ['mouseleave', 'pointerleave'].forEach(function (ev) {
      portal.addEventListener(ev, leave);
    });
    portal.addEventListener('focus', enter);
    portal.addEventListener('blur', leave);
    portal.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i + 1); }
    });
  }

  /* ---------------------------------------------------------
     9. 第二屏视窗
     --------------------------------------------------------- */
  function initFrame() {
    var frame = $('#frame'), stack = $('#frameStack'); if (!frame || !stack) return;
    var tEl = $('[data-frame-title]'), sEl = $('[data-frame-sub]'), iEl = $('[data-frame-idx]');
    var i = 0, timer = null;

    FRAME_SHOTS.forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'frame-slide';
      d.style.backgroundImage = 'url("' + enc(s.src) + '")';
      if (s.fit === 'contain') { d.style.backgroundSize = 'contain'; d.style.backgroundPosition = 'center'; }
      stack.appendChild(d);
    });
    var slides = $$('.frame-slide', stack);
    FRAME_SHOTS.forEach(function (s) { var im = new Image(); im.src = enc(s.src); });

    function show(n) {
      i = (n + FRAME_SHOTS.length) % FRAME_SHOTS.length;
      slides.forEach(function (el, k) { el.classList.toggle('on', k === i); });
      var d = FRAME_SHOTS[i];
      tEl.textContent = d.t; sEl.textContent = d.s;
      iEl.textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + FRAME_SHOTS.length).slice(-2);
    }
    function start() { if (!timer) timer = setInterval(function () { show(i + 1); }, 4600); }
    function stop() { clearInterval(timer); timer = null; }

    show(0);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.25 });
    io.observe(frame);

    $('#frameNext').addEventListener('click', function () { show(i + 1); stop(); start(); });
    $('#framePrev').addEventListener('click', function () { show(i - 1); stop(); start(); });
  }

  /* ---------------------------------------------------------
     10. 视窗外的滚动线稿
     --------------------------------------------------------- */
  function initSketches() {
    var field = $('#sketchField'); if (!field) return;
    var shapes = [
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><path d="M100 12 178 56v88l-78 44-78-44V56z"/><path d="M22 56l78 44 78-44M100 100v100"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><circle cx="100" cy="100" r="72"/><ellipse cx="100" cy="100" rx="72" ry="26"/><ellipse cx="100" cy="100" rx="26" ry="72"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><path d="M14 186 L74 46 L120 128 L146 74 L186 186z"/><path d="M14 186h172"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><circle cx="100" cy="100" r="78"/><path d="M100 22v156M22 100h156M44 44l112 112M156 44 44 156"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><rect x="26" y="26" width="148" height="148" rx="10"/><rect x="62" y="62" width="76" height="76" rx="6"/><path d="M26 100h36M138 100h36M100 26v36M100 138v36"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><path d="M100 24c42 0 76 30 76 66s-34 62-76 62-76-26-76-62"/><path d="M100 24v128M24 90h152"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><path d="M18 100h60M100 18v60M182 100h-60M100 182v-60"/><circle cx="100" cy="100" r="34"/><circle cx="100" cy="100" r="8"/></g></svg>',
      '<svg viewBox="0 0 200 200"><g stroke="currentColor" fill="none"><path d="M20 160 60 60l40 100L140 60l40 100"/><path d="M20 160h160"/><circle cx="60" cy="60" r="4"/><circle cx="140" cy="60" r="4"/></g></svg>'
    ];
    var layout = [
      { x: 4,  y: 6,  s: 190, d: -0.22 },
      { x: 78, y: 3,  s: 150, d: 0.30 },
      { x: 10, y: 58, s: 230, d: 0.16 },
      { x: 84, y: 62, s: 175, d: -0.28 },
      { x: 46, y: 30, s: 120, d: -0.42 },
      { x: 62, y: 82, s: 205, d: 0.24 },
      { x: 30, y: 84, s: 140, d: 0.36 },
      { x: 90, y: 34, s: 110, d: -0.14 }
    ];
    layout.forEach(function (L, i) {
      var d = document.createElement('div');
      d.className = 'sketch';
      d.style.left = L.x + '%';
      d.style.top = L.y + '%';
      d.style.width = L.s + 'px';
      d.style.height = L.s + 'px';
      d.style.color = 'rgba(250,250,248,.5)';
      d.innerHTML = shapes[i % shapes.length];
      d.setAttribute('data-depth', L.d);
      field.appendChild(d);
    });

    function update() {
      var rect = field.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh - rect.top) / (vh + rect.height); // 0 → 1
      $$('.sketch', field).forEach(function (el, i) {
        var d = parseFloat(el.getAttribute('data-depth'));
        var off = (p - 0.5) * 420 * d * 2;
        var rot = (p - 0.5) * 26 * d * 4;
        el.style.transform = 'translate3d(0,' + (-off) + 'px,0) rotate(' + rot + 'deg)';
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------------------------------------------------------
     11. (横向滚动画廊已下线：作品区改为「品牌画册」书架 + 翻页，见 1b)
     --------------------------------------------------------- */

  /* ---------------------------------------------------------
     13. 灯箱
     --------------------------------------------------------- */
  function initLightbox() {
    var lb = $('#lightbox'), stage = $('#lbStage'), counter = $('#lbCounter');
    if (!lb) return;
    var cur = null, idx = 0;
    var ENC = enc;

    function show() {
      if (!cur) return;
      var it = cur[idx];
      stage.innerHTML = '';
      if (it.type === 'video') {
        var v = document.createElement('video');
        v.src = ENC(it.src); v.poster = ENC(it.poster); v.controls = true; v.autoplay = true; v.playsInline = true;
        stage.appendChild(v);
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else {
        var im = document.createElement('img');
        im.src = ENC(it.src); im.alt = it.cap; stage.appendChild(im);
        if (it.cap) {
          var c = document.createElement('figcaption');
          c.className = 'lb-cap'; c.textContent = it.cap; stage.appendChild(c);
        }
      }
      counter.textContent = (idx + 1) + ' / ' + cur.length;
    }
    function open(g, n) {
      cur = groups[g]; idx = n; lb.classList.add('active');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      show();
    }
    function close() {
      lb.classList.remove('active'); lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = ''; stage.innerHTML = '';
      if (lenis) lenis.start();
    }
    function nav(d) { if (!cur) return; idx = (idx + d + cur.length) % cur.length; show(); }

    var g = $('#albumGraphic');
    if (g) g.addEventListener('click', function (e) {
      var cell = e.target.closest('.ph'); if (!cell) return;
      open('albumGraphic', Array.prototype.indexOf.call($$('.ph', g), cell));
    });
    var sg = $('#stickerGrid');
    if (sg) sg.addEventListener('click', function (e) {
      var cell = e.target.closest('.sm-tile'); if (!cell) return;
      open('stickerGrid', Array.prototype.indexOf.call($$('.sm-tile', sg), cell));
    });
    var vg = $('#videoGrid');
    if (vg) {
      var openVideo = function (card) { open('videoGrid', parseInt(card.getAttribute('data-idx'), 10) || 0); };
      vg.addEventListener('click', function (e) {
        var card = e.target.closest('.vcard'); if (!card) return;
        openVideo(card);
      });
      vg.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var card = e.target.closest('.vcard'); if (!card) return;
        e.preventDefault(); openVideo(card);
      });
    }
    var vig = $('#viGrid');
    if (vig) vig.addEventListener('click', function (e) {
      var cell = e.target.closest('.vi-cell'); if (!cell) return;
      open('viGrid', Array.prototype.indexOf.call($$('.vi-cell', vig), cell));
    });

    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { nav(-1); });
    $('#lbNext').addEventListener('click', function () { nav(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });
  }

  /* ---------------------------------------------------------
     14. 锚点导航
     --------------------------------------------------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        e.preventDefault();
        scrollToTarget(id);
      });
    });
  }

  /* ---------------------------------------------------------
     启动
     --------------------------------------------------------- */
  function boot() {
    buildAlbum(); buildVI(); buildStickers(); buildVideos(); buildUI(); buildResults();
    initSmooth(); initReveal(); initCounts(); initCursor(); initMenu();
    initPortal(); initFrame(); initSketches();
    initFlipbook(); initLightbox(); initAnchors();
    setTimeout(function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  document.addEventListener('DOMContentLoaded', initLoader);
  if (document.readyState !== 'loading') initLoader();
})();
