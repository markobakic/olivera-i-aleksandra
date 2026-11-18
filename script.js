/* =========================================================
   Žurka 99 · Olivera & Aleksandra
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isSmall = () => window.innerWidth < 600;

  const EVENT = {
    start: new Date(2026, 11, 11, 19, 0, 0),            // 11. decembar 2026, 19:00
    title: 'Žurka 99 – Olivera & Aleksandra',
    location: 'Restoran Institucija, Bežanijska kosa, Beograd',
    details: 'Olivera i Aleksandra zajedno pune 99 godina! Dress code: zeleno i ljubičasto. Ulaznica: 2 balona – jedan zeleni i jedan ljubičasti.',
    gStart: '20261211T190000',
    gEnd: '20261212T010000'
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let opened = false;

  /* =========================================================
     ZVEZDICE U POZADINI
     ========================================================= */
  (function makeSparkles() {
    const box = $('#sparkles');
    const count = isSmall() ? 26 : 50;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      const star = Math.random() < 0.18;
      s.className = 'sparkle ' + (star ? 'sparkle--star' : pick(['', 'sparkle--green', 'sparkle--purple', 'sparkle--gold']));
      s.style.left = rand(0, 100) + '%';
      s.style.top = rand(0, 100) + '%';
      s.style.setProperty('--s', rand(2, 4.5).toFixed(1) + 'px');
      s.style.setProperty('--t', rand(3, 7).toFixed(1) + 's');
      s.style.setProperty('--delay', (-rand(0, 7)).toFixed(1) + 's');
      frag.appendChild(s);
    }
    box.appendChild(frag);
  })();

  /* =========================================================
     TRAKE (tekst koji klizi)
     ========================================================= */
  $$('.ribbon__track').forEach((track) => {
    const text = track.dataset.text;
    const half = text.repeat(6);
    track.innerHTML = `<span>${half}</span><span>${half}</span>`;
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
     KONFETE + ISKRICE (gornji sloj)
     ========================================================= */
  const COLORS = ['#0b8a5c', '#17a873', '#076b47', '#4fd9a0', '#5a26b8', '#7a42d6', '#8e35c4', '#b994ff', '#ecc77d', '#fdeec9'];

  function setupCanvas(canvas, maxDpr) {
    const ctx = canvas.getContext('2d');
    const state = { ctx, W: 0, H: 0 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      state.W = window.innerWidth;
      state.H = window.innerHeight;
      canvas.width = state.W * dpr;
      canvas.height = state.H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return state;
  }

  const cf = setupCanvas($('#confetti'), 2);
  let particles = [];
  let cfRunning = false;

  function drawStar(ctx, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.45 : r;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Prasak konfeta.
   * o: count, angle (stepeni, -90 = gore), spread, speed, kind ('confetti' | 'spark')
   */
  function burst(x, y, o = {}) {
    const kind = o.kind || 'confetti';
    const count = Math.round((o.count || 80) * (reduceMotion ? 0.3 : 1));
    const angle = ((o.angle ?? -90) * Math.PI) / 180;
    const spread = ((o.spread ?? 360) * Math.PI) / 180;
    const speed = o.speed || 9;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * rand(0.45, 1.15);
      const r = Math.random();
      particles.push({
        kind,
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: kind === 'spark' ? 0.03 : rand(0.14, 0.24),
        w: rand(6, 13),
        h: rand(4, 8),
        size: kind === 'spark' ? rand(2, 4.5) : 0,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.25, 0.25),
        color: o.colors ? pick(o.colors) : pick(COLORS),
        shape: kind === 'spark' ? 'star' : r < 0.18 ? 'circle' : r < 0.32 ? 'star' : r < 0.45 ? 'ribbon' : 'rect',
        life: 0,
        maxLife: kind === 'spark' ? rand(28, 48) : rand(120, 200)
      });
    }
    if (!cfRunning) { cfRunning = true; requestAnimationFrame(cfTick); }
  }

  function rain(count = 120) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => burst(rand(0, cf.W), -20, { count: 1, angle: 90, spread: 40, speed: 3 }), rand(0, 1800));
    }
  }

  function cfTick() {
    const { ctx, W, H } = cf;
    ctx.clearRect(0, 0, W, H);
    particles = particles.filter((p) => p.life < p.maxLife && p.y < H + 40);
    for (const p of particles) {
      p.life++;
      p.vy += p.g;
      p.vx *= p.kind === 'spark' ? 0.94 : 0.985;
      p.vy *= p.kind === 'spark' ? 0.94 : 0.985;
      p.x += p.vx + (p.kind === 'spark' ? 0 : Math.sin(p.life / 10) * 0.6);
      p.y += p.vy;
      p.rot += p.vr;
      const fadeLen = p.kind === 'spark' ? p.maxLife : 30;
      const fade = p.life > p.maxLife - fadeLen ? (p.maxLife - p.life) / fadeLen : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.kind === 'spark') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        drawStar(ctx, p.size * (0.6 + fade * 0.6));
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.h / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        drawStar(ctx, p.h * 0.9);
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-1.5, -p.w, 3, p.w * 2 * Math.abs(Math.cos(p.life / 7)) + 2);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life / 8)) + 1);
      }
      ctx.restore();
    }
    if (particles.length) requestAnimationFrame(cfTick);
    else { cfRunning = false; ctx.clearRect(0, 0, W, H); }
  }

  function celebrate() {
    const { W, H } = cf;
    burst(0, H, { count: 120, angle: -60, spread: 50, speed: 18 });
    burst(W, H, { count: 120, angle: -120, spread: 50, speed: 18 });
    setTimeout(() => burst(W / 2, H * 0.35, { count: 100, speed: 11 }), 380);
    setTimeout(() => rain(100), 650);
  }

  /* =========================================================
     VATROMET (iza kartica)
     ========================================================= */
  const fw = setupCanvas($('#fireworks'), 1.5);
  const FW_PALETTES = [
    ['#6dffcb', '#00d68f', '#b6ffe6', '#ffffff'],           // Olivera
    ['#d77dff', '#9d5cff', '#e6ccff', '#ffffff'],           // Aleksandra
    ['#fdeec9', '#ecc77d', '#fff6dc'],                      // zlato
    ['#6dffcb', '#d77dff', '#ecc77d', '#9d5cff', '#00d68f'] // sve zajedno
  ];
  let rockets = [];
  let embers = [];
  let fwRunning = false;

  function launchRocket(x, targetY, palette) {
    const { H } = fw;
    const g = 0.12;
    rockets.push({
      x: x ?? rand(fw.W * 0.15, fw.W * 0.85),
      y: H + 10,
      vx: rand(-0.8, 0.8),
      vy: -Math.sqrt(2 * g * (H - (targetY ?? rand(H * 0.12, H * 0.42)))),
      g,
      palette: palette || pick(FW_PALETTES),
      trail: []
    });
    if (!fwRunning) { fwRunning = true; requestAnimationFrame(fwTick); }
  }

  function explode(r) {
    const n = isSmall() ? 55 : 80;
    const ring = Math.random() < 0.35;          // ponekad savršen krug
    for (let i = 0; i < n; i++) {
      const a = ring ? (i / n) * Math.PI * 2 : rand(0, Math.PI * 2);
      const s = ring ? 4.2 : rand(1, 5.2);
      embers.push({
        x: r.x, y: r.y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        alpha: 1,
        decay: rand(0.011, 0.02),
        color: pick(r.palette),
        size: rand(1.4, 2.6),
        twinkle: Math.random() < 0.4
      });
    }
  }

  function fwTick() {
    const { ctx, W, H } = fw;
    // tragovi koji blede (providna pozadina ostaje providna)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    rockets = rockets.filter((r) => {
      r.vy += r.g;
      r.x += r.vx;
      r.y += r.vy;
      ctx.fillStyle = '#fff6dc';
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (r.vy >= -0.5) { explode(r); return false; }
      return true;
    });

    embers = embers.filter((e) => {
      e.vx *= 0.965;
      e.vy *= 0.965;
      e.vy += 0.045;
      e.x += e.vx;
      e.y += e.vy;
      e.alpha -= e.decay;
      if (e.alpha <= 0) return false;
      const a = e.twinkle ? e.alpha * rand(0.3, 1) : e.alpha;
      ctx.globalAlpha = a;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;

    if (rockets.length || embers.length) requestAnimationFrame(fwTick);
    else {
      fwRunning = false;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
    }
  }

  function fireworksShow(n = 5) {
    for (let i = 0; i < n; i++) setTimeout(() => launchRocket(), i * rand(220, 420));
  }

  // tihi, povremeni vatromet u pozadini
  function ambientFireworks() {
    if (reduceMotion) return;
    const next = () => {
      if (!document.hidden) launchRocket();
      setTimeout(next, rand(2600, 5200));
    };
    setTimeout(next, 2500);
  }

  /* =========================================================
     BALONI (SVG, sa sjajem; ponekad srce od folije)
     ========================================================= */
  const layer = $('#balloons');
  const BALLOON_COLORS = [
    { hi: '#b9f5dc', c1: '#17a873', c2: '#076b47', c3: '#022016' },   // smaragd
    { hi: '#a6ecd0', c1: '#0b8a5c', c2: '#055c3d', c3: '#011a11' },   // šumsko zelena
    { hi: '#dccaff', c1: '#7a42d6', c2: '#4f1ea8', c3: '#16052f' },   // ametist
    { hi: '#e7c8ff', c1: '#8e35c4', c2: '#5a1585', c3: '#1f0533' },   // patlidžan
    { hi: '#d2c0ff', c1: '#5a26b8', c2: '#3d138c', c3: '#12042a' },   // tamna ljubičasta
    { hi: '#fffaf0', c1: '#fdeec9', c2: '#d9aa55', c3: '#7d5518' }    // zlatna (retko)
  ];
  const BALLOON_PATH = 'M50 4C77 4 96 27 96 56c0 33-27 56-42 62H46C31 112 4 89 4 56 4 27 23 4 50 4z';
  const HEART_PATH = 'M50 116C22 94 3 72 3 46 3 25 18 10 35 10c8 0 13 4 15 10 2-6 7-10 15-10 17 0 32 15 32 36 0 26-19 48-47 70z';
  const KNOT_PATH = 'M44 125l6-9 6 9z';

  const maxBalloons = () => (reduceMotion ? 4 : isSmall() ? 9 : 15);
  let activeBalloons = 0;
  let poppedCount = 0;
  let uid = 0;

  function balloonSVG(col, heart) {
    const id = 'bg' + (++uid);
    const fill = heart
      ? `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="${col.c1}"/><stop offset=".35" stop-color="${col.c2}"/>
           <stop offset=".5" stop-color="${col.hi}"/><stop offset=".65" stop-color="${col.c2}"/>
           <stop offset="1" stop-color="${col.c3}"/></linearGradient>`
      : `<radialGradient id="${id}" cx="36%" cy="28%" r="78%">
           <stop offset="0" stop-color="${col.hi}"/><stop offset=".22" stop-color="${col.c1}"/>
           <stop offset=".68" stop-color="${col.c2}"/><stop offset="1" stop-color="${col.c3}"/></radialGradient>`;
    return `
      <svg viewBox="0 0 100 180">
        <defs>${fill}</defs>
        <path class="balloon__string" d="M50 126c-7 10 7 18 0 27s6 13 0 25" fill="none" stroke="rgba(255,248,238,.65)" stroke-width="1.6"/>
        <g class="balloon__body">
          <path d="${heart ? HEART_PATH : BALLOON_PATH}" fill="url(#${id})"/>
          <ellipse cx="32" cy="${heart ? 34 : 30}" rx="8" ry="15" fill="#fff" opacity=".55" transform="rotate(-28 32 30)"/>
          <ellipse cx="40" cy="${heart ? 58 : 54}" rx="3" ry="5" fill="#fff" opacity=".35"/>
          <path d="${KNOT_PATH}" fill="${col.c3}"/>
        </g>
      </svg>`;
  }

  function spawnBalloon(delay = 0, forceColor) {
    if (activeBalloons >= maxBalloons() || document.hidden) return;
    const b = document.createElement('div');
    b.className = 'balloon';
    const size = rand(60, 108) * (isSmall() ? 0.78 : 1);
    const col = forceColor || (Math.random() < 0.08 ? BALLOON_COLORS[5] : pick(BALLOON_COLORS.slice(0, 5)));
    const heart = Math.random() < 0.15;
    b.style.setProperty('--x', rand(-2, 92).toFixed(1) + '%');
    b.style.setProperty('--size', size.toFixed(0) + 'px');
    b.style.setProperty('--dur', rand(14, 23).toFixed(1) + 's');
    b.style.setProperty('--sway', rand(2.4, 4.4).toFixed(1) + 's');
    b.style.setProperty('--delay', delay + 's');
    b.innerHTML = `<div class="balloon__inner">${balloonSVG(col, heart)}</div>`;
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
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    burst(cx, cy, { count: 34, speed: 7 });
    burst(cx, cy, { count: 16, speed: 6, kind: 'spark', colors: [b.dataset.c, '#fff6dc', '#ffffff'] });
    poppedCount++;
    if (poppedCount === 5) showToast('Bravo! Već 5 probušenih balona 🎈');
    if (poppedCount === 15) showToast('Pravi ste majstor za balone! 🎉');
    if (poppedCount === 30) { showToast('Rekord! Evo vatrometa za vas! 🎆'); fireworksShow(6); }
    setTimeout(() => removeBalloon(b), 900);
  }

  function startBalloons() {
    for (let i = 0; i < maxBalloons(); i++) spawnBalloon(+(i * 0.32).toFixed(2));
    setInterval(() => spawnBalloon(0), 1500);
  }

  /* =========================================================
     ISKRICE KOJE PRATE PRST / MIŠ
     ========================================================= */
  if (!reduceMotion) {
    let lastTrail = 0;
    const TRAIL = ['#6dffcb', '#e6ccff', '#fdeec9', '#d77dff', '#ffffff'];
    window.addEventListener('pointermove', (e) => {
      if (!opened) return;
      const now = performance.now();
      if (now - lastTrail < 35) return;
      lastTrail = now;
      burst(e.clientX, e.clientY, { count: 2, speed: 1.6, kind: 'spark', colors: TRAIL });
    }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      if (!opened || e.target.closest('.balloon')) return;
      burst(e.clientX, e.clientY, { count: 10, speed: 3.5, kind: 'spark', colors: TRAIL });
    }, { passive: true });
  }

  /* =========================================================
     3D NAGINJANJE KARTICA (samo sa mišem)
     ========================================================= */
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateZ(0)`;
        el.style.setProperty('--gx', px * 100 + '%');
        el.style.setProperty('--gy', py * 100 + '%');
        el.style.setProperty('--glare', '1');
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)';
        el.style.transform = '';
        el.style.setProperty('--glare', '0');
      });
    });
  }

  /* =========================================================
     POJAVLJIVANJE PRI SKROLOVANJU
     ========================================================= */
  let finaleShown = false;
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
        if (en.target.id === 'finale' && !finaleShown) {
          finaleShown = true;
          setTimeout(() => fireworksShow(reduceMotion ? 1 : 5), 400);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
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

    // zlatne iskrice iz koverte
    const env = $('#envelope').getBoundingClientRect();
    setTimeout(() => burst(env.left + env.width / 2, env.top + env.height * 0.3,
      { count: 40, speed: 6, kind: 'spark', colors: ['#fdeec9', '#ecc77d', '#ffffff', '#6dffcb', '#e6ccff'] }), 500);

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
      if (!reduceMotion) setTimeout(() => fireworksShow(4), 900);
      ambientFireworks();
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
     KALENDAR
     ========================================================= */
  const modal = $('#calendarModal');

  $('#googleCal').href =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(EVENT.title) +
    '&dates=' + EVENT.gStart + '/' + EVENT.gEnd +
    '&ctz=Europe/Belgrade' +
    '&location=' + encodeURIComponent(EVENT.location) +
    '&details=' + encodeURIComponent(EVENT.details);

  const icsEscape = (s) => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');

  function buildIcs() {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Zurka 99//Pozivnica//SR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:zurka99-20261211@olivera-aleksandra',
      'DTSTAMP:' + stamp,
      'DTSTART;TZID=Europe/Belgrade:' + EVENT.gStart,
      'DTEND;TZID=Europe/Belgrade:' + EVENT.gEnd,
      'SUMMARY:' + icsEscape(EVENT.title),
      'LOCATION:' + icsEscape(EVENT.location),
      'DESCRIPTION:' + icsEscape(EVENT.details),
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + icsEscape('Sutra je Žurka 99! Ponesite zeleni i ljubičasti balon.'),
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function openModal() {
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
  }
  function closeModal() {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  $('#calendarBtn').addEventListener('click', openModal);
  $('#closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  $('#googleCal').addEventListener('click', () => {
    closeModal();
    showToast('Otvara se Google kalendar — samo pritisnite „Sačuvaj“.');
  });
  $('#icsBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(buildIcs());
    a.download = 'zurka-99.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    closeModal();
    showToast('Gotovo! Otvorite preuzeti fajl i potvrdite dodavanje u kalendar.');
  });

  /* =========================================================
     DUGME "POKRENI VATROMET"
     ========================================================= */
  $('#partyBtn').addEventListener('click', (e) => {
    initAudio();
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, { count: 150, angle: -90, spread: 120, speed: 15 });
    fireworksShow(reduceMotion ? 2 : 7);
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnBalloon(0, BALLOON_COLORS[i % 2 ? 2 : 0]), i * 200);
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
