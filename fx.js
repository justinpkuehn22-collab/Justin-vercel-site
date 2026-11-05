(function(){
  /* ---------- always start new pages at the top ---------- */
  if (!location.hash) {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    var t0 = Date.now(), touched = false;
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) { addEventListener(ev, function () { touched = true; }, { once: true, passive: true }); });
    var toTop = function () { if (touched || !scrollY) return; var r = document.documentElement; r.style.scrollBehavior = 'auto'; scrollTo(0, 0); r.style.scrollBehavior = ''; };
    toTop(); addEventListener('load', toTop);
    var iv = setInterval(function () { if (Date.now() - t0 > 1800) { clearInterval(iv); return; } toTop(); }, 40);
  }
})();
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(pointer: fine)').matches;
  var PAGES = /^(index|work|story|hobbies|connect)\.html/;


  /* ---------- splash out ---------- */
  var R = document.documentElement;
  if (R.classList.contains('jk-splash')) {
    var started = window.__jkT0 || Date.now();
    var done = function () {
      var wait = Math.max(0, 1300 - (Date.now() - started));
      setTimeout(function () { R.classList.add('jk-splash-out'); setTimeout(function () { R.classList.remove('jk-splash', 'jk-splash-out'); }, 520); }, wait);
    };
    if (document.readyState === 'complete') done(); else addEventListener('load', done);
  }

  /* ---------- page transitions ---------- */
  if (!RM) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      var h = a.getAttribute('href');
      if (!PAGES.test(h)) return;
      var cur = location.pathname.split('/').pop() || 'index.html';
      if (h.split(/[?#]/)[0] === cur && h.indexOf('#') > -1) return;
      e.preventDefault();
      document.body.classList.add('fx-leave');
      var go = a.href;
      setTimeout(function () { location.href = go; }, 240);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('fx-leave'); });
  }

  /* ---------- headline word reveals ---------- */
  function split(el) {
    var i = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (!n.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var o = document.createElement('span'), w = document.createElement('span');
        o.className = 'fx-w'; w.textContent = part; w.style.setProperty('--i', i++);
        o.appendChild(w); frag.appendChild(o);
      });
      n.parentNode.replaceChild(frag, n);
    });
    el.classList.add('fx-split');
  }
  if (!RM && 'IntersectionObserver' in window) {
    var heads = document.querySelectorAll('header h1, .head h2, .books-head h2, .close h2, .feat h2, .cs-head h2, .work-head h2');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .2 });
    heads.forEach(function (h) { split(h); io.observe(h); });
  }

  /* ---------- count-up stats ---------- */
  var stats = document.querySelectorAll('.stat b');
  if (stats.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; so.unobserve(e.target);
        var t = e.target.firstChild; if (!t || t.nodeType !== 3) return;
        var m = t.nodeValue.match(/^(\d+)(K?)$/); if (!m) return;
        var end = +m[1], suf = m[2], start = performance.now(), dur = RM ? 0 : 1400;
        (function step(now) {
          var p = dur ? Math.min(1, (now - start) / dur) : 1;
          var v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          t.nodeValue = v + suf;
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: .6 });
    stats.forEach(function (s) { var t = s.firstChild; if (t && t.nodeType === 3 && /^\d+K?$/.test(t.nodeValue)) { so.observe(s); } });
  }

  /* ---------- 3D tilt cards ---------- */
  if (FINE && !RM) {
    document.querySelectorAll('.app, .cs .vis').forEach(function (el) {
      el.classList.add('fx-tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .08s linear';
        el.style.transform = 'perspective(900px) rotateX(' + ((.5 - y) * 9).toFixed(2) + 'deg) rotateY(' + ((x - .5) * 11).toFixed(2) + 'deg) translateY(-4px)';
        el.style.setProperty('--gx', (x * 100) + '%'); el.style.setProperty('--gy', (y * 100) + '%');
        el.classList.add('fx-on');
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)'; el.style.transform = ''; el.classList.remove('fx-on');
      });
    });
    /* magnetic primary buttons */
    document.querySelectorAll('.btn-signal, .close .btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- cursor fizz ---------- */
  if (FINE && !RM) {
    var fc = document.createElement('canvas'); fc.className = 'fx-fizz'; fc.setAttribute('aria-hidden', 'true');
    document.body.appendChild(fc);
    var fctx = fc.getContext('2d'), bubbles = [], fraf = 0, dpr = Math.min(2, window.devicePixelRatio || 1), mv = 0;
    function fsize() { fc.width = innerWidth * dpr; fc.height = innerHeight * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    fsize(); addEventListener('resize', fsize);
    function ftick() {
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = bubbles.length - 1; i >= 0; i--) {
        var q = bubbles[i]; q.t++; q.y -= q.vy; q.vy *= 1.01; q.x += Math.sin((q.t + q.ph) / 9) * .5;
        var life = 1 - q.t / q.max; if (life <= 0) { bubbles.splice(i, 1); continue; }
        fctx.globalAlpha = life * .85; fctx.strokeStyle = q.c; fctx.lineWidth = 1.4;
        fctx.beginPath(); fctx.arc(q.x, q.y, q.r, 0, 7); fctx.stroke();
        fctx.globalAlpha = life * .6; fctx.fillStyle = '#fff'; fctx.beginPath(); fctx.arc(q.x - q.r * .35, q.y - q.r * .35, q.r * .28, 0, 7); fctx.fill();
      }
      fctx.globalAlpha = 1;
      fraf = bubbles.length ? requestAnimationFrame(ftick) : 0;
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || (mv++ % 3)) return;
      if (bubbles.length > 70) return;
      bubbles.push({ x: e.clientX + (Math.random() * 10 - 5), y: e.clientY + 6, r: 1.8 + Math.random() * 3.6, vy: .6 + Math.random() * .9, t: 0, max: 50 + Math.random() * 40, ph: Math.random() * 60, c: Math.random() < .7 ? '#E4002B' : '#FF8A8A' });
      if (!fraf) fraf = requestAnimationFrame(ftick);
    });
  }


  /* ---------- Coke counters ---------- */
  var cokes = document.querySelectorAll('[data-coke]');
  if (cokes.length && 'IntersectionObserver' in window) {
    var ko = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; ko.unobserve(e.target);
        var el = e.target, end = +el.getAttribute('data-coke'), t0 = performance.now(), dur = RM ? 0 : 1600;
        (function tick(now) { var p = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: .6 });
    cokes.forEach(function (c) { ko.observe(c); });
  }

  /* ---------- arrival highlight on The builds ---------- */
  if (location.hash) {
    var tgt = document.getElementById(location.hash.slice(1));
    if (tgt && tgt.classList.contains('cs')) setTimeout(function () { tgt.classList.add('fx-hit'); }, 500);
  }


  /* ---------- mobile menu ---------- */
  var nav = document.querySelector('.nav'), links = nav && nav.querySelector('.links');
  if (nav && links) {
    var tools = document.createElement('div'); tools.className = 'nav-tools';
    var tg = links.querySelector('.theme-tg'), tgHome = tg && tg.nextSibling, mq = matchMedia('(max-width: 760px)');
    function placeTg() { if (!tg) return; if (mq.matches) tools.insertBefore(tg, tools.firstChild); else links.insertBefore(tg, tgHome); }
    var mb = document.createElement('button'); mb.type = 'button'; mb.className = 'menu-btn';
    mb.setAttribute('aria-label', 'Menu'); mb.setAttribute('aria-expanded', 'false'); mb.innerHTML = '<span></span>';
    tools.appendChild(mb); links.parentNode.appendChild(tools); placeTg(); mq.addEventListener ? mq.addEventListener('change', placeTg) : mq.addListener(placeTg);
    mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', function (e) { if (nav.classList.contains('open') && !nav.contains(e.target)) { nav.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- story text slide-ins ---------- */
  var tl = document.querySelector('.timeline');
  if (tl && !RM && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('fx-story');
    var cards = tl.querySelectorAll('.card');
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; co.unobserve(e.target); e.target.classList.add('fx-in');
        e.target.querySelectorAll(':scope > .facts span').forEach(function (s, i) { s.style.transitionDelay = (0.9 + i * 0.14) + 's'; });
      });
    }, { threshold: .2, rootMargin: '0px 0px -18% 0px' });
    cards.forEach(function (c) { co.observe(c); });
  }


  /* ---------- builds: rocking cards ---------- */
  var csList = document.querySelectorAll('.cs');
  if (csList.length && !RM && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('fx-builds');
    var bo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; bo.unobserve(e.target);
        var el = e.target, t = 0.55;
        var head = el.querySelectorAll('.story > h3, .story > .pitch');
        head.forEach(function (h, i) { h.style.transitionDelay = (0.35 + i * 0.12) + 's'; });
        el.querySelectorAll('.b').forEach(function (b, i) { b.style.transitionDelay = (t + i * 0.16) + 's'; });
        var nb = el.querySelectorAll('.b').length;
        el.querySelectorAll('.b.diff li').forEach(function (li, i) { li.style.transitionDelay = (t + nb * 0.16 + 0.15 + i * 0.12) + 's'; });
        el.classList.add('in');
      });
    }, { threshold: .04, rootMargin: '0px 0px -6% 0px' });
    csList.forEach(function (c, i) { if (i % 2) c.classList.add('alt'); bo.observe(c); });
    /* a card reached by link shows straight away */
    if (location.hash) { var h = document.getElementById(location.hash.slice(1)); if (h && h.classList.contains('cs')) h.classList.add('in'); }
  }

  /* ---------- hoops court engine (shared) ---------- */
  function makeCourt(cv, onMake) {
    var cx = cv.getContext('2d');
    var W = 340, H = 300, made = 0, streak = 0, flash = 0, msg = '';
    var rim = { x1: 236, x2: 288, y: 108 }, board = { x: 296, y1: 50, y2: 120 };
    var ball, drag = null, running = false;
    var fizzP = [];
    function burst(str) {
      var n = str >= 3 ? 60 : 38, cxm = (rim.x1 + rim.x2 + 8) / 2;
      for (var i = 0; i < n; i++) fizzP.push({ x: cxm + (Math.random() * 30 - 15), y: rim.y + 24, vx: (Math.random() - .5) * 5, vy: -(4 + Math.random() * (str >= 3 ? 8 : 6)), r: 1.5 + Math.random() * 3.5, t: 0, max: 55 + Math.random() * 35, c: ['#E4002B', '#FF6B6B', '#FFFFFF', '#E4002B'][i % 4], fill: Math.random() < .35 });
    }
    function reset() { ball = { x: 70, y: 240, vx: 0, vy: 0, r: 13, live: false, scored: false, t: 0 }; }
    reset();
    function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888'; }
    function draw() {
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = css('--soft'); cx.fillRect(0, 262, W, H - 262);
      cx.strokeStyle = css('--line'); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, 262); cx.lineTo(W, 262); cx.stroke();
      // board + pole
      cx.fillStyle = css('--muted'); cx.fillRect(board.x + 6, board.y2, 5, 262 - board.y2);
      cx.fillStyle = css('--surface'); cx.strokeStyle = css('--ink'); cx.lineWidth = 3;
      cx.fillRect(board.x, board.y1, 8, board.y2 - board.y1); cx.strokeRect(board.x, board.y1, 8, board.y2 - board.y1);
      // net
      cx.strokeStyle = css('--muted'); cx.lineWidth = 1.5;
      for (var i = 0; i <= 4; i++) { var nx = rim.x1 + (rim.x2 - rim.x1) * i / 4; cx.beginPath(); cx.moveTo(nx, rim.y); cx.lineTo(rim.x1 + 8 + (rim.x2 - rim.x1 - 16) * i / 4, rim.y + 30); cx.stroke(); }
      // ball
      cx.fillStyle = css('--agave'); cx.beginPath(); cx.arc(ball.x, ball.y, ball.r, 0, 7); cx.fill();
      cx.strokeStyle = 'rgba(0,0,0,.45)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(ball.x - ball.r, ball.y); cx.lineTo(ball.x + ball.r, ball.y); cx.moveTo(ball.x, ball.y - ball.r); cx.lineTo(ball.x, ball.y + ball.r); cx.stroke();
      // rim (front)
      cx.strokeStyle = css('--agave'); cx.lineWidth = 4; cx.beginPath(); cx.moveTo(rim.x1, rim.y); cx.lineTo(rim.x2 + 8, rim.y); cx.stroke();
      // aim
      if (drag) {
        var vx = (drag.sx - drag.x) * .16, vy = (drag.sy - drag.y) * .16, px = ball.x, py = ball.y;
        cx.fillStyle = css('--signal');
        for (var k = 0; k < 30; k++) { vy += .5; px += vx; py += vy; if (k % 3 === 2) { cx.globalAlpha = 1 - k / 30; cx.beginPath(); cx.arc(px, py, 3, 0, 7); cx.fill(); } }
        cx.globalAlpha = 1;
      }
      for (var pi = fizzP.length - 1; pi >= 0; pi--) {
        var f = fizzP[pi]; f.t++; f.vy += .16; f.vx *= .985; f.x += f.vx; f.y += f.vy;
        var fl = 1 - f.t / f.max; if (fl <= 0 || f.y > 262) { fizzP.splice(pi, 1); continue; }
        cx.globalAlpha = fl; cx.strokeStyle = f.c; cx.lineWidth = 1.6; cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 7); cx.stroke();
        if (f.fill) { cx.fillStyle = f.c; cx.globalAlpha = fl * .5; cx.fill(); }
      }
      cx.globalAlpha = 1;
      if (flash > 0) { cx.fillStyle = css('--signal-t'); cx.font = '800 30px ' + (css('--display') || 'sans-serif'); cx.textAlign = 'center'; cx.globalAlpha = Math.min(1, flash / 20); cx.fillText(msg, W / 2, 60); cx.globalAlpha = 1; flash--; }
    }
    function step() {
      if (ball.live) {
        ball.vy += .5; ball.x += ball.vx; ball.y += ball.vy; ball.t++;
        // backboard
        if (ball.x + ball.r > board.x && ball.x < board.x + 8 && ball.y > board.y1 && ball.y < board.y2 && ball.vx > 0) { ball.x = board.x - ball.r; ball.vx *= -.55; }
        // rim ends
        [rim.x1, rim.x2 + 8].forEach(function (rx) {
          var dx = ball.x - rx, dy = ball.y - rim.y, d = Math.hypot(dx, dy);
          if (d < ball.r + 2) { var nx = dx / d, ny = dy / d, dot = ball.vx * nx + ball.vy * ny; if (dot < 0) { ball.vx -= 1.6 * dot * nx; ball.vy -= 1.6 * dot * ny; } ball.x = rx + nx * (ball.r + 2); ball.y = rim.y + ny * (ball.r + 2); }
        });
        // score
        if (!ball.scored && ball.vy > 0 && ball.y - ball.vy < rim.y && ball.y >= rim.y && ball.x > rim.x1 + 4 && ball.x < rim.x2 + 4) {
          ball.scored = true; made++; streak++; if (onMake) onMake(made, streak); burst(streak);
          msg = streak >= 3 ? 'On fire! ' + streak + ' straight' : (streak === 2 ? 'Back to back!' : 'Bucket!'); flash = 50;
        }
        // floor
        if (ball.y + ball.r > 262) { ball.y = 262 - ball.r; ball.vy *= -.5; ball.vx *= .8; }
        if (ball.x < -30 || ball.x > W + 30 || ball.t > 200) { if (!ball.scored) streak = 0; reset(); }
      }
      draw();
      if (running) requestAnimationFrame(step);
    }
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    cv.addEventListener('pointerdown', function (e) { if (ball.live) return; var p = pt(e); if (Math.hypot(p.x - ball.x, p.y - ball.y) > 60) return; drag = { sx: ball.x, sy: ball.y, x: p.x, y: p.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drag) return; var p = pt(e); drag.x = p.x; drag.y = p.y; });
    cv.addEventListener('pointerup', function () {
      if (!drag) return;
      ball.vx = Math.max(-18, Math.min(18, (drag.sx - drag.x) * .16)); ball.vy = Math.max(-18, Math.min(18, (drag.sy - drag.y) * .16));
      if (Math.hypot(ball.vx, ball.vy) > 1.5) ball.live = true; drag = null;
    });
    function run(v) { if (v && !running) { running = true; requestAnimationFrame(step); } else if (!v) running = false; }
    return { run: run };
  }
  window.jkCourt = makeCourt;

  /* ---------- hoops easter egg ---------- */
  var foot = document.querySelector('footer .wrap');
  if (!foot) return;
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'hoop-btn'; btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/></svg>Shoot around';
  foot.appendChild(btn);
  var box = document.createElement('div'); box.className = 'hoops'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Hoops mini-game');
  box.innerHTML = '<header><span>Shoot around · <b class="hs">0</b> made</span><button type="button" aria-label="Close">✕</button></header><canvas width="340" height="300"></canvas><p>Drag back from the ball and let go to shoot.</p>';
  document.body.appendChild(box);
  var scoreEl = box.querySelector('.hs');
  var court = makeCourt(box.querySelector('canvas'), function (n) { scoreEl.textContent = n; });
  function open(v) {
    box.hidden = !v; btn.setAttribute('aria-expanded', String(v));
    if (typeof fab !== 'undefined') fab.hidden = v;
    court.run(v);
    if (v) box.querySelector('header button').focus();
  }
  btn.addEventListener('click', function () { open(box.hidden); });
  var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'hoop-fab'; fab.setAttribute('aria-label', 'Play the hoops mini-game');
  fab.innerHTML = '<span class="ball"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1A1638" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#FF8A5B"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/></svg></span><span class="lbl">Take a shot</span>';
  document.body.appendChild(fab);
  fab.addEventListener('click', function () { open(true); });
  setTimeout(function () { fab.classList.add('peek'); setTimeout(function () { fab.classList.remove('peek'); }, 3800); }, 1400);
  document.querySelectorAll('.int').forEach(function (t) {
    var b = t.querySelector('b'); if (!b || b.textContent.trim() !== 'Basketball') return;
    t.setAttribute('data-hoops', ''); t.setAttribute('role', 'button'); t.tabIndex = 0;
    t.addEventListener('click', function () { open(true); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); } });
  });
  box.querySelector('header button').addEventListener('click', function () { open(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) { open(false); btn.focus(); } });
})();
