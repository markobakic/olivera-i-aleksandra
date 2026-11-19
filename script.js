/* =========================================================
   Žurka 99 · Olivera & Aleksandra
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LITE = document.documentElement.classList.contains('lite');   // telefon / slabiji uređaj
  const FX = LITE ? 0.55 : 1;                                          // koliko konfeta

  const EVENT = {
    start: new Date(2026, 11, 11, 19, 0, 0)             // 11. decembar 2026, 19:00
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let opened = false;

  /* =========================================================
     BOJE BALONA
     ========================================================= */
  const C = {
    green:    { hi: '#e3fbf0', c1: '#4fd3a0', c2: '#14a072', c3: '#0a6b4c' },
    mint:     { hi: '#f4fffa', c1: '#a5ebcf', c2: '#3cc28f', c3: '#16855f' },
    purple:   { hi: '#f1eaff', c1: '#a983f0', c2: '#7446cc', c3: '#4a2390' },
    lavender: { hi: '#fbf8ff', c1: '#d2bff8', c2: '#9b72ea', c3: '#6a43bf' },
    gold:     { hi: '#fffaf0', c1: '#f3d896', c2: '#d4a845', c3: '#94691c' },
    pearl:    { hi: '#ffffff', c1: '#fdf8f0', c2: '#e9dcc8', c3: '#bba88b' }
  };
  const FLOAT_COLORS = [C.green, C.green, C.mint, C.purple, C.purple, C.lavender, C.gold, C.pearl];

  const BALLOON_PATH = 'M50 4C77 4 96 27 96 56c0 33-27 56-42 62H46C31 112 4 89 4 56 4 27 23 4 50 4z';
  const HEART_PATH = 'M50 116C22 94 3 72 3 46 3 25 18 10 35 10c8 0 13 4 15 10 2-6 7-10 15-10 17 0 32 15 32 36 0 26-19 48-47 70z';
  const KNOT_PATH = 'M44 125l6-9 6 9z';
  let uid = 0;

  /** SVG balon (ili srce od folije) sa sjajem i kanapom */
  function balloonSVG(col, opts = {}) {
    const id = 'bg' + (++uid);
    const heart = !!opts.heart;
    const fill = heart
      ? `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="${col.c1}"/><stop offset=".38" stop-color="${col.c2}"/>
           <stop offset=".52" stop-color="${col.hi}"/><stop offset=".66" stop-color="${col.c2}"/>
           <stop offset="1" stop-color="${col.c3}"/></linearGradient>`
      : `<radialGradient id="${id}" cx="36%" cy="28%" r="80%">
           <stop offset="0" stop-color="${col.hi}"/><stop offset=".2" stop-color="${col.c1}"/>
           <stop offset=".7" stop-color="${col.c2}"/><stop offset="1" stop-color="${col.c3}"/></radialGradient>`;
    const string = opts.noString ? '' :
      `<path class="balloon__string" d="M50 126c-7 10 7 18 0 27s6 13 0 25" fill="none" stroke="#bfae96" stroke-width="1.6"/>`;
    return `
      <svg viewBox="0 0 100 ${opts.noString ? 128 : 180}">
        <defs>${fill}</defs>
        ${string}
        <g class="balloon__body">
          <path d="${heart ? HEART_PATH : BALLOON_PATH}" fill="url(#${id})"/>
          <ellipse cx="32" cy="${heart ? 34 : 30}" rx="8" ry="15" fill="#fff" opacity=".6" transform="rotate(-28 32 30)"/>
          <ellipse cx="41" cy="${heart ? 58 : 54}" rx="3" ry="5" fill="#fff" opacity=".4"/>
          <path d="${KNOT_PATH}" fill="${col.c3}"/>
        </g>
      </svg>`;
  }

  /* ---------------- statični baloni u karticama ---------------- */
  $$('[data-balloon]').forEach((el) => {
    el.innerHTML = balloonSVG(el.dataset.balloon === 'green' ? C.green : C.purple);
  });

  /* ---------------- grozdovi balona oko luka ---------------- */
  const CLUSTER = [
    // w = širina (% grozda), l = levo (%), t = gore (%), r = nagib
    { c: 'green',    w: 46, l: 30, t: 0,  r: -6 },
    { c: 'purple',   w: 42, l: 0,  t: 14, r: -14 },
    { c: 'gold',     w: 32, l: 56, t: 22, r: 8 },
    { c: 'lavender', w: 36, l: 20, t: 30, r: -4 },
    { c: 'mint',     w: 30, l: 0,  t: 44, r: -12 }
  ];
  function buildCluster(el, mirror) {
    el.innerHTML = CLUSTER.map((b, i) => {
      let color = b.c;
      if (mirror) color = { green: 'purple', purple: 'green', mint: 'lavender', lavender: 'mint', gold: 'gold' }[b.c];
      const left = mirror ? 100 - b.l - b.w : b.l;
      const r = mirror ? -b.r : b.r;
      return `<span class="cb" style="--w:${b.w}%;--l:${left}%;--t:${b.t}%;--r:${r}deg;--dur:${(4 + i * 0.6).toFixed(1)}s;--del:${(-i * 0.9).toFixed(1)}s">${balloonSVG(C[color])}</span>`;
    }).join('');
  }
  buildCluster($('#clusterLeft'), false);
  buildCluster($('#clusterRight'), true);

  /* ---------------- zvezdice u pozadini ---------------- */
  (function makeSparkles() {
    const box = $('#sparkles');
    const count = LITE ? 10 : 20;
    const colors = ['#e2bf6e', '#e2bf6e', '#7fe6bd', '#b796f5'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = rand(0, 100) + '%';
      s.style.top = rand(0, 100) + '%';
      s.style.setProperty('--s', rand(8, 16).toFixed(0) + 'px');
      s.style.setProperty('--c', pick(colors));
      s.style.setProperty('--t', rand(3.5, 7).toFixed(1) + 's');
      s.style.setProperty('--delay', (-rand(0, 7)).toFixed(1) + 's');
      frag.appendChild(s);
    }
    box.appendChild(frag);
  })();

  /* ---------------- traka sa tekstom ---------------- */
  $$('.ribbon__track').forEach((track) => {
    const half = track.dataset.text.repeat(5);
    for (let i = 0; i < 2; i++) {
      const span = document.createElement('span');
      span.textContent = half;
      track.appendChild(span);
    }
  });

  /* =========================================================
     ZVUK (blagi "pop")
     ========================================================= */
  let audioCtx = null;
  function initAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx && !audioCtx) audioCtx = new Ctx();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) { audioCtx = null; }
  }
  function popSound() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const len = Math.floor(audioCtx.sampleRate * 0.12);
    const buffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = rand(900, 1600);
    filter.Q.value = 0.8;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    src.connect(filter).connect(gain).connect(audioCtx.destination);
    src.start(t);
  }

  /* =========================================================
     KONFETE
     ========================================================= */
  const COLORS = ['#0f8a62', '#22b07f', '#7fe6bd', '#7446cc', '#9b72ea', '#cdb8f6', '#e2bf6e', '#c39433'];
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, LITE ? 1.5 : 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let particles = [];
  let running = false;
  const CAP = LITE ? 300 : 800;

  function drawStar(r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }

  function makeParticle(x, y, vx, vy, colors) {
    const r = Math.random();
    return {
      x, y, vx, vy,
      g: rand(0.14, 0.22),
      w: rand(7, 13), h: rand(5, 9),
      rot: rand(0, Math.PI * 2), vr: rand(-0.22, 0.22),
      color: colors ? pick(colors) : pick(COLORS),
      shape: r < 0.2 ? 'circle' : r < 0.34 ? 'star' : r < 0.46 ? 'ribbon' : 'rect',
      life: 0, maxLife: rand(130, 210)
    };
  }

  /** o: count, angle (stepeni, -90 = gore), spread, speed, colors */
  function burst(x, y, o = {}) {
    const count = Math.max(1, Math.round((o.count || 80) * (reduceMotion ? 0.3 : FX)));
    const angle = ((o.angle ?? -90) * Math.PI) / 180;
    const spread = ((o.spread ?? 360) * Math.PI) / 180;
    const speed = o.speed || 9;
    for (let i = 0; i < count && particles.length < CAP; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * rand(0.45, 1.15);
      particles.push(makeParticle(x, y, Math.cos(a) * v, Math.sin(a) * v, o.colors));
    }
    start();
  }

  // kiša konfeta odozgo – jedan rAF umesto stotinu tajmera
  function rain(count = 110) {
    count = Math.round(count * FX);
    const t0 = performance.now();
    let made = 0;
    const step = (now) => {
      const target = Math.min(count, Math.round(((now - t0) / 1800) * count));
      for (; made < target && particles.length < CAP; made++) {
        const p = makeParticle(rand(0, W), -20, rand(-1, 1), rand(1, 3));
        p.g = rand(0.05, 0.1);
        p.maxLife = rand(170, 250);
        particles.push(p);
      }
      start();
      if (made < count) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function start() {
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter((p) => p.life < p.maxLife && p.y < H + 40);
    for (const p of particles) {
      p.life++;
      p.vy += p.g;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx + Math.sin(p.life / 10) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      const fade = p.life > p.maxLife - 30 ? (p.maxLife - p.life) / 30 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(p.h * 0.9);
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-1.5, -p.w, 3, p.w * 2 * Math.abs(Math.cos(p.life / 7)) + 2);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life / 8)) + 1);
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  function celebrate() {
    burst(0, H, { count: 110, angle: -60, spread: 50, speed: 18 });
    burst(W, H, { count: 110, angle: -120, spread: 50, speed: 18 });
    setTimeout(() => burst(W / 2, H * 0.35, { count: 90, speed: 11 }), 380);
    setTimeout(() => rain(110), 650);
  }

  /* =========================================================
     LETEĆI BALONI
     ========================================================= */
  const layer = $('#balloons');
  const maxBalloons = () => (reduceMotion ? 4 : LITE ? 6 : 13);
  let activeBalloons = 0;
  let poppedCount = 0;

  function spawnBalloon(delay = 0, forceColor) {
    if (activeBalloons >= maxBalloons() || document.hidden) return;
    const b = document.createElement('div');
    b.className = 'balloon';
    const size = rand(58, 100) * (window.innerWidth < 600 ? 0.8 : 1);
    const col = forceColor || pick(FLOAT_COLORS);
    b.style.setProperty('--x', rand(-2, 92).toFixed(1) + '%');
    b.style.setProperty('--size', size.toFixed(0) + 'px');
    b.style.setProperty('--dur', rand(15, 24).toFixed(1) + 's');
    b.style.setProperty('--sway', rand(2.6, 4.4).toFixed(1) + 's');
    b.style.setProperty('--delay', delay + 's');
    b.innerHTML = `<div class="balloon__inner">${balloonSVG(col, { heart: Math.random() < 0.15 })}</div>`;
    b.dataset.c = col.c1;

    b.addEventListener('pointerdown', () => popBalloon(b));
    b.addEventListener('animationend', (e) => {
      if (e.animationName === 'rise' && !b.classList.contains('is-popped')) removeBalloon(b);
    });

    layer.appendChild(b);
    activeBalloons++;
  }

  function removeBalloon(b) {
    if (b.dataset.gone) return;
    b.dataset.gone = '1';
    b.remove();
    activeBalloons--;
  }

  function popBalloon(b) {
    if (b.classList.contains('is-popped')) return;
    initAudio();
    const r = b.querySelector('.balloon__body').getBoundingClientRect();
    b.classList.add('is-popped');
    popSound();
    burst(r.left + r.width / 2, r.top + r.height / 2, { count: 36, speed: 7, colors: [b.dataset.c, '#e2bf6e', ...COLORS] });
    poppedCount++;
    if (poppedCount === 5) showToast('Bravo! Već 5 probušenih balona 🎈');
    if (poppedCount === 15) showToast('Pravi ste majstor za balone! 🎉');
    setTimeout(() => removeBalloon(b), 900);
  }

  function startBalloons() {
    for (let i = 0; i < maxBalloons(); i++) spawnBalloon(+(i * 0.4).toFixed(2));
    setInterval(() => spawnBalloon(0), LITE ? 2400 : 1600);
  }

  /* =========================================================
     POJAVLJIVANJE PRI SKROLOVANJU + PAUZA VAN EKRANA
     ========================================================= */
  function startReveals() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));

    const pauser = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('is-paused', !en.isIntersecting));
    }, { rootMargin: '120px 0px' });
    $$('.hero, .ribbon, .duo, .invite > .card, .ticket-wrap, .finale').forEach((el) => pauser.observe(el));
  }

  /* =========================================================
     OTVARANJE KOVERTE
     ========================================================= */
  const intro = $('#intro');
  const invite = $('#invite');

  function openInvite() {
    if (opened) return;
    opened = true;
    initAudio();
    intro.classList.add('is-open');

    const env = $('#envelope').getBoundingClientRect();
    setTimeout(() => burst(env.left + env.width / 2, env.top + env.height * 0.3,
      { count: 40, speed: 7, colors: ['#e2bf6e', '#c39433', '#22b07f', '#9b72ea'] }), 600);

    const wait = reduceMotion ? 250 : 1750;
    setTimeout(() => {
      invite.hidden = false;
      document.body.classList.remove('is-locked');
      window.scrollTo(0, 0);
      intro.classList.add('is-gone');
      startReveals();
      celebrate();
      startBalloons();
      startCountdown();
      setTimeout(() => intro.remove(), 1000);
    }, wait);
  }

  $('#openBtn').addEventListener('click', openInvite);
  $('#envelope').addEventListener('click', openInvite);

  /* =========================================================
     ODBROJAVANJE
     ========================================================= */
  // srpska množina: 1 dan, 2 dana, 5 dana / 1 sat, 2 sata, 5 sati ...
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  const WORDS = {
    days: ['dan', 'dana', 'dana'],
    hours: ['sat', 'sata', 'sati'],
    minutes: ['minut', 'minuta', 'minuta'],
    seconds: ['sekunda', 'sekunde', 'sekundi']
  };
  const last = {};
  let cdTimer = null;

  function updateCountdown() {
    const diff = EVENT.start - new Date();
    if (diff <= 0) {
      $('#countdown').hidden = true;
      $('#countdownDone').hidden = false;
      clearInterval(cdTimer);
      return;
    }
    const values = {
      days: Math.floor(diff / 864e5),
      hours: Math.floor((diff / 36e5) % 24),
      minutes: Math.floor((diff / 6e4) % 60),
      seconds: Math.floor((diff / 1e3) % 60)
    };
    for (const unit of Object.keys(values)) {
      const v = values[unit];
      if (last[unit] === v) continue;
      last[unit] = v;
      const numEl = document.querySelector(`[data-unit="${unit}"]`);
      const labelEl = document.querySelector(`[data-label="${unit}"]`);
      numEl.textContent = unit === 'days' ? String(v) : String(v).padStart(2, '0');
      labelEl.textContent = plural(v, ...WORDS[unit]);
      numEl.classList.remove('flip');
      void numEl.offsetWidth;          // restart animacije
      numEl.classList.add('flip');
    }
  }
  function startCountdown() {
    updateCountdown();
    cdTimer = setInterval(updateCountdown, 1000);
  }

  /* =========================================================
     DUGME "JOŠ KONFETA I BALONA"
     ========================================================= */
  $('#partyBtn').addEventListener('click', (e) => {
    initAudio();
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, { count: 150, angle: -90, spread: 120, speed: 15 });
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnBalloon(0, i % 2 ? C.purple : C.green), i * 220);
    }
  });

  /* =========================================================
     PORUKA
     ========================================================= */
  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-shown'), 4200);
  }
})();
