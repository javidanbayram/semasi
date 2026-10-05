/* =====================================================================
   APP — builds the album pages, sizes the book, wires StPageFlip,
   the cinematic intro, controls, keyboard and fullscreen.
   ===================================================================== */
(function () {
  'use strict';

  const CONFIG = window.CONFIG;
  const PAGES = window.PAGES;
  const $ = (s, r = document) => r.querySelector(s);

  const scene = $('#scene');
  const stage = $('#book-stage');
  const bookEl = $('#book');
  const stackL = $('#stack-left');
  const stackR = $('#stack-right');
  const counter = $('#page-counter');
  const INNER = PAGES.length; // 18

  /* ------------------------------------------------------------------
     SVG DOODLE LIBRARY (hand-drawn feel, currentColor strokes)
     ------------------------------------------------------------------ */
  const SVG = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M12 2.5l2.7 6.6 7 .5-5.4 4.5 1.8 6.9L12 17.2l-6.1 3.8 1.8-6.9L2.3 9.6l7-.5z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5c.7 5.6 3.6 9 10.5 10.5-6.9 1.5-9.8 4.9-10.5 10.5C11.3 16.9 8.4 13.5 1.5 12 8.4 10.5 11.3 7.1 12 1.5z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M12 20.5s-7.6-4.6-9.4-9.2C1.2 7.6 3.7 4 7.3 4c2 0 3.6 1.1 4.7 2.8C13.1 5.1 14.7 4 16.7 4c3.6 0 6.1 3.6 4.7 7.3-1.8 4.6-9.4 9.2-9.4 9.2z"/></svg>',
    heartFill: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.6-4.6-9.4-9.2C1.2 7.6 3.7 4 7.3 4c2 0 3.6 1.1 4.7 2.8C13.1 5.1 14.7 4 16.7 4c3.6 0 6.1 3.6 4.7 7.3-1.8 4.6-9.4 9.2-9.4 9.2z"/></svg>',
    arrow: '<svg viewBox="0 0 60 30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 24c10 2 20-2 28-10 6-6 14-9 24-7"/><path d="M48 3l7 4-6 6"/></svg>',
    flower: '<svg viewBox="0 0 40 60" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M20 58c0-14 1-24-1-36"/><path d="M19 40c-6-2-10-6-11-11 5 0 9 3 11 8M20 34c5-3 9-7 10-12-5 1-8 4-10 9"/><circle cx="19" cy="14" r="4"/><path d="M19 10c-2-6 2-9 0-9s2 3 0 9M15 14c-6-1-8 2-8 0s2-1 8 0M23 14c6-1 8 2 8 0s-2-1-8 0M17 17c-4 4-3 7-5 6s1-3 5-6M21 17c4 4 3 7 5 6s-1-3-5-6"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
    swirl: '<svg viewBox="0 0 80 20" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M2 12c8-8 14 6 22 0s14 6 22 0 14 6 22 0 8-2 10-2"/></svg>',
    gem: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">
      <circle cx="60" cy="60" r="56" stroke-width=".8" stroke-dasharray="1 4"/>
      <circle cx="60" cy="60" r="48" stroke-width=".7"/>
      <path d="M40 38h40l16 18-36 36-36-36z"/>
      <path d="M24 56h72M40 38l-4 18 24 36 24-36-4-18M60 38l-10 18h20z"/>
      <path d="M60 4v10M60 106v10M4 60h10M106 60h10M20 20l7 7M93 93l7 7M100 20l-7 7M27 93l-7 7" stroke-width=".9"/>
    </svg>`,
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-4.6-2.2L3.6 15a1.5 1.5 0 0 1 2.3-1.9L9 16"/></svg>',
  };
  const doodle = (name, cls, style = '') => `<span class="doodle ${cls}" style="${style}" aria-hidden="true">${SVG[name]}</span>`;

  /** Photo element: local file first, Unsplash demo fallback (wired in hydratePhotos). */
  const img = (file, alt = 'Səmanın şəkli') =>
    `<img data-photo="${file}" alt="${alt}" draggable="false" decoding="async" />`;

  /** Glitter sprinkles for the sparkle layout. */
  function glitter(n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = (Math.random() * 100).toFixed(1);
      const y = (Math.random() * 100).toFixed(1);
      const d = (Math.random() * 3).toFixed(2);
      const sz = (0.8 + Math.random() * 1.8).toFixed(2);
      s += `<i class="glint" style="left:${x}%;top:${y}%;animation-delay:${d}s;--s:${sz}"></i>`;
    }
    return `<div class="glitter" aria-hidden="true">${s}</div>`;
  }

  /* ------------------------------------------------------------------
     PAGE TEMPLATES (one function per layout archetype)
     ------------------------------------------------------------------ */
  const T = {
    title: (p) => `
      <div class="pg pg-title">
        <div class="pg-title__frame">
          <p class="kicker">${p.kicker}</p>
          ${p.title ? `<h2 class="script pg-title__name">${p.title}</h2>` : ''}
          ${doodle('swirl', 'pg-title__swirl')}
          <p class="serif-italic pg-title__text">${p.text}</p>
          ${p.sign ? `<p class="hand pg-title__sign">${p.sign}</p>` : ''}
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        </div>
        ${doodle('flower', 'd-flower', 'right:8%;bottom:6%')}
        ${doodle('sparkle', 'd-gold', 'left:12%;top:10%;width:5cqw')}
      </div>`,

    /* Layout A — Classic Polaroid */
    polaroid: (p) => {
      const corners = p.tilt > 0;
      return `
      <div class="pg pg-polaroid">
        <figure class="polaroid ${corners ? 'polaroid--corners' : ''}" style="--tilt:${p.tilt}deg">
          ${corners
          ? '<span class="corner c-tl"></span><span class="corner c-tr"></span><span class="corner c-bl"></span><span class="corner c-br"></span>'
          : '<span class="tape tape--tl"></span><span class="tape tape--tr"></span>'}
          <div class="polaroid__photo">${img(p.photo)}<span class="gloss"></span></div>
          ${p.date ? `<figcaption class="hand polaroid__date">${p.date}</figcaption>` : ''}
        </figure>
        <p class="caption">${p.caption}</p>
        <p class="hand note">${p.note} ${doodle('arrow', 'note__arrow')}</p>
        ${doodle('heart', 'd-red', 'left:9%;bottom:9%;width:6cqw;transform:rotate(-14deg)')}
        ${doodle('star', 'd-gold', 'right:10%;top:7%;width:5cqw')}
      </div>`;
    },

    /* Layout B — Dual collage */
    dual: (p) => `
      <div class="pg pg-dual">
        <div class="dual">
          <figure class="print dual__a">${img(p.photos[0])}<span class="gloss"></span></figure>
          <figure class="print dual__b">${img(p.photos[1])}<span class="gloss"></span></figure>
          ${p.label ? `<span class="tape tape--label hand">${p.label}</span>` : ''}
        </div>
        <blockquote class="quote-sm">${p.quote}</blockquote>
        ${p.date ? `<p class="hand date">${p.date}</p>` : ''}
        ${doodle('sparkle', 'd-gold', 'left:8%;top:8%;width:4.5cqw')}
        ${doodle('heart', 'd-red', 'right:9%;bottom:8%;width:5cqw;transform:rotate(12deg)')}
      </div>`,

    /* Layout C — Intimate letter */
    letter: (p) => `
      <div class="pg pg-letter">
        <div class="letter">
          <p class="script letter__greet">${p.greeting}</p>
          ${p.paragraphs.map((t) => `<p class="hand letter__p">${t}</p>`).join('')}
          <p class="script letter__sign">${p.sign}</p>
        </div>
        <span class="wax-seal" aria-hidden="true">${SVG.heartFill}</span>
        ${doodle('flower', 'd-flower', 'left:5%;bottom:4%;transform:rotate(-18deg)')}
      </div>`,

    /* Layout D — 35mm film strip */
    film: (p) => `
      <div class="pg pg-film">
        <h3 class="pg-heading">${p.title}</h3>
        <div class="film">
          ${p.photos.map((f, i) => `
            <div class="film__frame">${img(f)}<span class="film__num">${24 + i}</span></div>`).join('')}
          <span class="film__brand">KODAK PORTRA 400</span>
        </div>
        <p class="caption">${p.caption}</p>
        ${p.date ? `<p class="hand date">${p.date}</p>` : ''}
        ${doodle('star', 'd-gold', 'right:9%;top:10%;width:5cqw')}
        ${doodle('star', 'd-gold', 'left:10%;bottom:20%;width:3.5cqw')}
      </div>`,

    /* Layout E — Gemstone / sparkle spread */
    sparkle: (p) => `
      <div class="pg pg-sparkle">
        <h3 class="script pg-sparkle__title">${p.title}</h3>
        <div class="gem-frame">
          <div class="gem-frame__photo">${img(p.photo)}<span class="gloss"></span></div>
          ${doodle('sparkle', 'd-gold s1')}
          ${doodle('sparkle', 'd-gold s2')}
          ${doodle('star', 'd-gold s3')}
          ${doodle('heart', 'd-red s4')}
          ${doodle('moon', 'd-gold s5')}
          ${doodle('sparkle', 'd-gold s6')}
          ${glitter(16)}
        </div>
        <p class="caption">${p.caption}</p>
      </div>`,

    list: (p) => `
      <div class="pg pg-list">
        <h3 class="script pg-list__title">${p.title}</h3>
        <ul class="love-list">
          ${p.items.map((t) => `<li class="hand"><span class="love-list__mark">${SVG.heart}</span>${t}</li>`).join('')}
        </ul>
        ${doodle('flower', 'd-flower', 'right:7%;bottom:5%;transform:rotate(10deg)')}
        ${doodle('sparkle', 'd-gold', 'left:10%;bottom:10%;width:4cqw')}
      </div>`,

    quote: (p) => `
      <div class="pg pg-quote">
        <span class="pg-quote__mark" aria-hidden="true">“</span>
        <blockquote class="pg-quote__text">${p.quote}</blockquote>
        <p class="pg-quote__author">— ${p.author}</p>
        ${doodle('swirl', 'pg-quote__swirl')}
        <p class="hand pg-quote__note">${p.note}</p>
        ${doodle('star', 'd-gold', 'left:12%;top:14%;width:4cqw')}
        ${doodle('sparkle', 'd-gold', 'right:14%;top:22%;width:5cqw')}
        ${doodle('moon', 'd-gold', 'right:12%;bottom:10%;width:6cqw')}
        ${doodle('heart', 'd-red', 'left:12%;bottom:12%;width:5cqw')}
      </div>`,

    mosaic: (p) => `
      <div class="pg pg-mosaic">
        <h3 class="pg-heading">${p.title}</h3>
        <div class="mosaic">
          ${p.photos.map((f, i) => `
            <figure class="mini" style="--r:${[-4, 3, 2.5, -3][i]}deg">
              <span class="tape tape--mini"></span>${img(f)}
            </figure>`).join('')}
        </div>
        <p class="caption">${p.caption}</p>
      </div>`,

    tribute: (p) => `
      <div class="pg pg-tribute">
        <div class="tribute">
          <span class="tribute__inf" aria-hidden="true">∞</span>
          <p class="tribute__text">${p.text}</p>
          ${doodle('swirl', 'tribute__swirl')}
          <p class="script tribute__sign">Sevgi ilə</p>
        </div>
        ${doodle('heart', 'd-red', 'left:14%;top:12%;width:4cqw;transform:rotate(-12deg)')}
        ${doodle('heart', 'd-red', 'right:14%;bottom:12%;width:5cqw;transform:rotate(14deg)')}
      </div>`,

    finale: (p) => `
      <div class="pg pg-finale">
      </div>`,
  };

  /* ------------------------------------------------------------------
     COVERS
     ------------------------------------------------------------------ */
  const frontCover = () => `
    <div class="page page--cover page--cover-front" data-density="hard">
      <div class="cover">
        <div class="cover__frame"><i></i><i></i><i></i><i></i></div>
        <div class="cover__content">
          <div class="cover__emblem foil-stroke">${SVG.gem}</div>
          <p class="cover__subtitle foil" style="margin-top: 4cqw;">Dünyanın Ən Gözəl İnsanı<br>Səmanın Albomu</p>
        </div>
        <div class="cover__cue">
          <span class="cover__hand">${SVG.hand}</span>
          <span>Vərəqləmək üçün toxun və ya sürüşdür</span>
        </div>
        <div class="cover__sheen" aria-hidden="true"></div>
      </div>
    </div>`;

  const backCover = () => `
    <div class="page page--cover page--cover-back" data-density="hard">
      <div class="cover cover--back">
        <div class="cover__frame"><i></i><i></i><i></i><i></i></div>
        <div class="cover__content">
          <div class="cover__emblem cover__emblem--sm foil-stroke">${SVG.gem}</div>
          <p class="cover__subtitle foil">davamı var...</p>
          <p class="cover__mono foil">✦</p>
        </div>
        <div class="cover__sheen" aria-hidden="true"></div>
      </div>
    </div>`;

  /* ------------------------------------------------------------------
     BUILD THE BOOK
     ------------------------------------------------------------------ */
  function buildPages() {
    let html = frontCover();
    PAGES.forEach((p, i) => {
      const n = i + 1;
      const side = n % 2 === 1 ? 'left' : 'right';
      // First & last inner pages are endpapers glued to the boards → stiff flip
      const hard = n === 1 || n === INNER;
      html += `
        <div class="page page--paper page--${side} layout-${p.layout}" data-density="${hard ? 'hard' : 'soft'}">
          <div class="page__inner">${T[p.layout](p)}</div>
          <div class="page__crease" aria-hidden="true"></div>
          ${p.layout !== 'finale' ? `<span class="page__num">${n}</span>` : ''}
        </div>`;
    });
    html += backCover();
    bookEl.innerHTML = html;
    hydratePhotos();
  }

  /** Try photos/photoN.jpg → Unsplash demo → picsum as a last resort. */
  function hydratePhotos() {
    bookEl.querySelectorAll('img[data-photo]').forEach((el) => {
      const file = el.dataset.photo;
      const chain = [
        CONFIG.photoDir + file,
        window.DEMO_PHOTOS[file],
        `https://picsum.photos/seed/${encodeURIComponent(file)}/800/800`,
      ].filter(Boolean);
      let i = 0;
      el.addEventListener('error', () => { if (++i < chain.length) el.src = chain[i]; });
      el.addEventListener('load', () => el.classList.add('is-loaded'));
      el.src = chain[0];
    });
  }

  /* ------------------------------------------------------------------
     RESPONSIVE SIZING
     We compute the largest book that fits the viewport (both axes),
     then let StPageFlip "stretch" into that exact width.
     ------------------------------------------------------------------ */
  const MIN_PAGE_W = 250;            // StPageFlip switches to portrait below 2×this
  let isPortrait = false;

  function layoutBook() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const small = vw < 700;
    const padX = small ? 14 : 56;
    const padTop = small ? 70 : 86;
    const padBottom = small ? 100 : 116;
    const availW = vw - padX * 2;
    const availH = Math.max(260, vh - padTop - padBottom);
    const r = CONFIG.pageRatio;

    const spreadW = Math.min(availW, availH * r * 2);
    let width;
    if (!small && spreadW >= MIN_PAGE_W * 2 + 60) {
      isPortrait = false;
      width = Math.floor(spreadW / 2) * 2;
    } else {
      isPortrait = true;
      width = Math.floor(Math.min(availW, availH * r, MIN_PAGE_W * 2 - 20));
    }
    const height = Math.round(isPortrait ? width / r : width / 2 / r);

    stage.style.width = width + 'px';
    stage.style.height = height + 'px';
    bookEl.style.width = width + 'px';
    scene.style.setProperty('--book-h', height + 'px');
    scene.classList.toggle('is-portrait', isPortrait);
    if (pageFlip) {
      pageFlip.update();
    }
  }

  /* ------------------------------------------------------------------
     STPAGEFLIP
     ------------------------------------------------------------------ */
  let pageFlip = null;
  let total = 0;

  function initFlip() {
    const r = CONFIG.pageRatio;
    pageFlip = new St.PageFlip(bookEl, {
      width: 500,
      height: Math.round(500 / r),
      size: 'stretch',
      minWidth: MIN_PAGE_W,
      maxWidth: 1400,
      minHeight: 100,
      maxHeight: 2400,
      autoSize: true,
      showCover: true,
      usePortrait: true,
      drawShadow: true,
      maxShadowOpacity: 0.55,
      flippingTime: 600,
      mobileScrollSupport: false,
      swipeDistance: 24,
      showPageCorners: true,
      startZIndex: 2,
    });
    pageFlip.loadFromHTML(bookEl.querySelectorAll('.page'));
    total = pageFlip.getPageCount();

    pageFlip.on('flip', (e) => updateUI(e.data));
    pageFlip.on('changeOrientation', () => updateUI(pageFlip.getCurrentPageIndex()));
    pageFlip.on('changeState', (e) => {
      const state = e.data;
      if (state === 'flipping') {
        const idx = pageFlip.getCurrentPageIndex();
        if (idx === 0 || idx >= total - 1) window.SoundFX.coverThud();
        else window.SoundFX.paperRustle();
        // Slide the closed book back to centre while the cover opens
        stage.classList.remove('at-front', 'at-back');
        stage.classList.add('is-open');
      }
      if (state === 'read') updateUI(pageFlip.getCurrentPageIndex());
    });

    updateUI(0);
  }

  /** Counter, nav button states, closed-book centring & page-block depth. */
  function updateUI(idx) {
    const portrait = pageFlip.getOrientation() === 'portrait';
    const atFront = idx === 0;
    const atBack = idx >= total - 1;

    // Live counter
    let label;
    if (atFront) label = 'Üz qabığı';
    else if (atBack) label = 'Arxa qabıq';
    else if (portrait) label = `Səhifə ${idx} / ${INNER}`;
    else {
      const left = idx % 2 === 1 ? idx : idx - 1;
      label = `Səhifə ${left}–${Math.min(left + 1, INNER)} / ${INNER}`;
    }
    counter.textContent = label;

    $('#btn-prev').disabled = atFront;
    $('#btn-next').disabled = atBack;

    stage.classList.toggle('at-front', atFront && !portrait);
    stage.classList.toggle('at-back', atBack && !portrait);
    stage.classList.toggle('is-open', !atFront && !atBack);
    scene.classList.toggle('is-portrait', portrait);

    if (idx >= total - 1) {
      document.body.classList.add('show-true-finale');
    } else {
      document.body.classList.remove('show-true-finale');
    }

    updateStacks(idx, portrait);
  }

  /** Visible paper-block thickness on both sides, proportional to progress. */
  function updateStacks(idx, portrait) {
    const MAX = 12;
    const progress = idx / (total - 1);
    const right = Math.round((1 - progress) * MAX);
    const left = Math.round(progress * MAX);
    stackR.style.boxShadow = stackShadow(right, 1);
    stackL.style.boxShadow = portrait ? 'none' : stackShadow(left, -1);
    stackL.style.opacity = portrait || left === 0 ? 0 : 1;
    stackR.style.opacity = right === 0 ? 0 : 1;
  }

  function stackShadow(n, dir) {
    if (n <= 0) return 'none';
    const layers = [];
    for (let k = 1; k <= n; k++) {
      const shade = 236 - k * 3 - (k % 2) * 14;
      layers.push(`${dir * k}px ${k * 0.55}px 0 rgb(${shade}, ${shade - 8}, ${shade - 24})`);
    }
    // Hardcover board peeking out underneath the paper block
    layers.push(`${dir * (n + 2)}px ${(n + 2) * 0.55}px 0 #2b0f3d`);
    layers.push(`${dir * (n + 3)}px ${(n + 3) * 0.55}px 0 #1a0826`);
    return layers.join(',');
  }

  /* ------------------------------------------------------------------
     FINALE COUNTDOWN → next local midnight (Day 7)
     ------------------------------------------------------------------ */
  function startCountdown() {
    const el = bookEl.querySelector('[data-countdown]');
    if (!el) return;
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      let s = Math.max(0, Math.floor((midnight - now) / 1000));
      const h = Math.floor(s / 3600); s -= h * 3600;
      const m = Math.floor(s / 60); s -= m * 60;
      el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------
     PIN LOCK
     ------------------------------------------------------------------ */
  const PIN_CODE = '0102';  // ← change this to set your PIN
  let pinEntry = '';
  let pinLocked = false;

  function initPinLock() {
    const lock = $('#pin-lock');
    const dots = $('#pin-dots');
    const dotEls = dots.querySelectorAll('.pin-dot');
    const error = $('#pin-error');
    const pad = $('#pin-pad');

    function updateDots() {
      dotEls.forEach((d, i) => {
        d.classList.toggle('is-filled', i < pinEntry.length);
      });
    }

    function handleKey(key) {
      if (pinLocked) return;
      error.textContent = '';
      dots.classList.remove('is-wrong', 'is-correct');

      if (key === 'clear') {
        pinEntry = '';
        updateDots();
        return;
      }
      if (key === 'back') {
        pinEntry = pinEntry.slice(0, -1);
        updateDots();
        return;
      }
      if (pinEntry.length >= 4) return;
      pinEntry += key;
      updateDots();

      if (pinEntry.length === 4) {
        pinLocked = true;
        if (pinEntry === PIN_CODE) {
          dots.classList.add('is-correct');
          window.SoundFX.unlock();
          window.SoundFX.chime();
          setTimeout(() => openAlbum(), 500);
        } else {
          dots.classList.add('is-wrong');
          error.textContent = 'Yanlış şifrə! Yenidən cəhd et.';
          setTimeout(() => {
            pinEntry = '';
            pinLocked = false;
            dots.classList.remove('is-wrong');
            updateDots();
          }, 800);
        }
      }
    }

    pad.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-key]');
      if (btn) handleKey(btn.dataset.key);
    });

    document.addEventListener('keydown', (e) => {
      if (lock.classList.contains('is-unlocked')) return;
      if (e.key >= '0' && e.key <= '9') handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('back');
      else if (e.key === 'Escape') handleKey('clear');
    });
  }

  function openAlbum() {
    const lock = $('#pin-lock');
    lock.classList.add('is-unlocked');
    window.Particles && window.Particles.setMode('ambient');

    // Automatically start background music upon opening
    if (window.SoundFX && !window.SoundFX.isPlaying) {
      window.SoundFX.startMusic();
      const musicBtn = $('#music-toggle');
      if (musicBtn) {
        musicBtn.classList.add('is-playing');
        musicBtn.setAttribute('aria-pressed', 'true');
      }
    }

    setTimeout(() => { scene.classList.add('is-album'); }, 200);
    setTimeout(() => { lock.hidden = true; }, 1000);
  }

  /* ------------------------------------------------------------------
     CONTROLS
     ------------------------------------------------------------------ */
  function bindControls() {
    $('#btn-prev').addEventListener('click', () => pageFlip.flipPrev('top'));
    $('#btn-next').addEventListener('click', () => pageFlip.flipNext('top'));
    $('#btn-restart').addEventListener('click', () => {
      if (pageFlip.getCurrentPageIndex() > 0) pageFlip.flip(0, 'top');
    });

    const music = $('#music-toggle');
    music.addEventListener('click', () => {
      const on = window.SoundFX.toggleMusic();
      music.classList.toggle('is-playing', on);
      music.setAttribute('aria-pressed', String(on));
    });

    const fsBtn = $('#btn-fullscreen');
    const root = document.documentElement;
    const canFS = !!(root.requestFullscreen || root.webkitRequestFullscreen);
    if (!canFS) fsBtn.hidden = true;
    fsBtn.addEventListener('click', () => {
      const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    });
    const onFS = () => fsBtn.classList.toggle('is-fs', !!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFS);
    document.addEventListener('webkitfullscreenchange', onFS);

    document.addEventListener('keydown', (e) => {
      if (!scene.classList.contains('is-album')) return;
      if (e.key === 'ArrowRight') pageFlip.flipNext('top');
      if (e.key === 'ArrowLeft') pageFlip.flipPrev('top');
      if (e.key === 'Home') pageFlip.flip(0, 'top');
    });
  }

  /* ------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------ */
  function boot() {
    buildPages();
    layoutBook();
    window.addEventListener('resize', layoutBook);
    if (!window.St || !window.St.PageFlip) {
      console.error('StPageFlip failed to load.');
      return;
    }
    initFlip();
    startCountdown();
    bindControls();
    initPinLock();
  }

  boot();
})();
