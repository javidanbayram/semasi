/* =====================================================================
   SOUND ENGINE — 100% procedural Web Audio (no external sound files)
   - paperRustle(): band-pass filtered white-noise burst (page flip)
   - coverThud():   low "hardcover" knock layered with the rustle
   - chime():       magical bell arpeggio + airy swoosh (intro button)
   - Music:         generative soft romantic piano with reverb, or an
                    <audio> file if CONFIG.musicUrl is provided
   ===================================================================== */
(function () {
  'use strict';

  let ctx = null;
  let master = null;
  let reverb = null;
  let noiseBuffer = null;

  /** Lazily create the AudioContext (must happen after a user gesture). */
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      reverb = createReverb(3.6, 2.4);
      reverb.connect(master);
      noiseBuffer = createNoiseBuffer(1.2);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function createNoiseBuffer(seconds) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Synthetic impulse response: exponentially decaying stereo noise. */
  function createReverb(seconds, decay) {
    const conv = ctx.createConvolver();
    const len = Math.floor(ctx.sampleRate * seconds);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    conv.buffer = ir;
    return conv;
  }

  /* ------------------------------------------------------------------
     PAGE FLIP: crisp high-grammage cardstock rustle
     Band-passed white noise, gain 0.4 → 0.001 exponentially in 350 ms.
     ------------------------------------------------------------------ */
  let lastRustle = 0;
  function paperRustle(intensity = 1) {
    if (!ensure()) return;
    const now = ctx.currentTime;
    if (now - lastRustle < 0.08) return; // debounce rapid double triggers
    lastRustle = now;

    const dur = 0.35;

    // Main crisp body
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 0.9 + Math.random() * 0.25;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2600 + Math.random() * 900, now);
    bp.frequency.exponentialRampToValueAtTime(1300, now + dur); // sweep = page travelling
    bp.Q.value = 0.9;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.4 * intensity, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(bp).connect(g).connect(master);
    src.start(now, Math.random() * 0.6, dur + 0.05);

    // Subtle crackle texture (tiny high transients = paper fibres)
    const crk = ctx.createBufferSource();
    crk.buffer = noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 5200;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.0001, now);
    for (let t = 0; t < dur; t += 0.03) {
      cg.gain.setValueAtTime(Math.random() * 0.09 * intensity * (1 - t / dur), now + t);
    }
    cg.gain.setValueAtTime(0.0001, now + dur);
    crk.connect(hp).connect(cg).connect(master);
    crk.start(now, Math.random() * 0.5, dur);

    // Soft low "whoosh" of air
    const air = ctx.createBufferSource();
    air.buffer = noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    const ag = ctx.createGain();
    ag.gain.setValueAtTime(0.0001, now);
    ag.gain.exponentialRampToValueAtTime(0.18 * intensity, now + 0.09);
    ag.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.1);
    air.connect(lp).connect(ag).connect(master);
    air.start(now, Math.random() * 0.4, dur + 0.15);
  }

  /** Hardcover: a padded low knock + softer rustle. */
  function coverThud() {
    if (!ensure()) return;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, now);
    o.frequency.exponentialRampToValueAtTime(55, now + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    o.connect(g).connect(master);
    o.start(now);
    o.stop(now + 0.32);
    paperRustle(0.6);
  }

  /** Magical chime: shimmering bell arpeggio + swoosh. */
  function chime() {
    if (!ensure()) return;
    const now = ctx.currentTime;
    const notes = [76, 81, 83, 88, 93]; // E5 A5 B5 E6 A6
    notes.forEach((m, i) => {
      const t = now + i * 0.085;
      const f = midi(m);
      [1, 2.76, 5.4].forEach((partial, k) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f * partial;
        const g = ctx.createGain();
        const peak = [0.12, 0.035, 0.012][k];
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2 - k * 0.5);
        o.connect(g);
        g.connect(master);
        g.connect(reverb);
        o.start(t);
        o.stop(t + 2.3);
      });
    });

    // Airy swoosh
    const s = ctx.createBufferSource();
    s.buffer = noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(400, now);
    bp.frequency.exponentialRampToValueAtTime(6000, now + 0.9);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    s.connect(bp).connect(g);
    g.connect(master);
    g.connect(reverb);
    s.start(now, 0, 1.15);
  }

  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ------------------------------------------------------------------
     GENERATIVE PIANO (fallback / default ambient music)
     I – V/7 – vi7 – IVmaj7 in C, gentle arpeggios at ~68 BPM.
     ------------------------------------------------------------------ */
  const PROGRESSION = [
    [48, 55, 60, 62, 64, 67, 64, 60], // Cadd9
    [47, 55, 59, 62, 67, 62, 59, 55], // G/B
    [45, 52, 57, 60, 64, 67, 64, 60], // Am7
    [41, 48, 53, 57, 60, 64, 60, 57], // Fmaj7
  ];
  const MELODY = [[76, 79, 74, 72], [74, 79, 71, 67], [76, 72, 79, 69], [72, 76, 69, 77]];

  let musicBus = null;
  let schedTimer = null;
  let nextTime = 0;
  let step = 0;
  const EIGHTH = 60 / 68 / 2;

  function pianoNote(m, time, vel, len) {
    const f = midi(m);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, time);
    out.gain.exponentialRampToValueAtTime(vel, time + 0.006);
    out.gain.exponentialRampToValueAtTime(vel * 0.35, time + 0.35);
    out.gain.exponentialRampToValueAtTime(0.0001, time + len);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(5200, f * 9), time);
    lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2), time + len);

    [[1, 'sine', 1], [2, 'triangle', 0.22], [3, 'sine', 0.07], [4.02, 'sine', 0.03]].forEach(([mul, type, amp]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f * mul;
      o.detune.value = (Math.random() - 0.5) * 6;
      const g = ctx.createGain();
      g.gain.value = amp;
      o.connect(g).connect(lp);
      o.start(time);
      o.stop(time + len + 0.05);
    });
    lp.connect(out).connect(musicBus);
  }

  function scheduler() {
    while (nextTime < ctx.currentTime + 0.4) {
      const bar = Math.floor(step / 8) % PROGRESSION.length;
      const i = step % 8;
      const note = PROGRESSION[bar][i];
      if (i === 0) {
        pianoNote(note - 12, nextTime, 0.16, 4.5); // deep bass
        pianoNote(note, nextTime, 0.1, 3.8);
      } else {
        pianoNote(note, nextTime, 0.055 + Math.random() * 0.02, 2.6);
      }
      // Sparse singing melody on beats 1 & 3
      if ((i === 0 || i === 4) && Math.random() < 0.7) {
        const mel = MELODY[bar][(i / 4 + Math.floor(step / 32)) % 4];
        pianoNote(mel, nextTime + 0.02, 0.075, 3.4);
      }
      nextTime += EIGHTH * (1 + (Math.random() - 0.5) * 0.04); // human rubato
      step++;
    }
  }

  function startSynth() {
    if (!ensure()) return;
    if (!musicBus) {
      musicBus = ctx.createGain();
      const dry = ctx.createGain();
      dry.gain.value = 0.7;
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      musicBus.connect(dry).connect(master);
      musicBus.connect(wet).connect(reverb);
    }
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 2.5);
    nextTime = ctx.currentTime + 0.1;
    clearInterval(schedTimer);
    schedTimer = setInterval(scheduler, 120);
  }

  function stopSynth() {
    if (!ctx || !musicBus) return;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    setTimeout(() => clearInterval(schedTimer), 1200);
  }

  /* ------------------------------------------------------------------
     PUBLIC MUSIC API (file first, synth fallback)
     ------------------------------------------------------------------ */
  let playing = false;
  let useFile = !!(window.CONFIG && window.CONFIG.musicUrl);
  const audioEl = document.getElementById('bg-music');

  async function startMusic() {
    ensure();
    playing = true;
    useFile = !!(window.CONFIG && window.CONFIG.musicUrl);
    if (useFile && audioEl) {
      try {
        if (audioEl.getAttribute('src') !== window.CONFIG.musicUrl) {
          audioEl.src = window.CONFIG.musicUrl;
        }
        audioEl.volume = 0;
        await audioEl.play();
        fadeElement(audioEl, 0.55, 2000);
        return;
      } catch (e) {
        console.warn('[audio] music file failed, falling back to synth piano', e);
        useFile = false;
      }
    }
    startSynth();
  }

  function stopMusic() {
    playing = false;
    if (useFile && audioEl && !audioEl.paused) {
      fadeElement(audioEl, 0, 900, () => audioEl.pause());
    } else {
      stopSynth();
    }
  }

  function fadeElement(el, target, ms, done) {
    const start = el.volume;
    const t0 = performance.now();
    (function tick(t) {
      const k = Math.min(1, (t - t0) / ms);
      el.volume = start + (target - start) * k;
      if (k < 1) requestAnimationFrame(tick);
      else if (done) done();
    })(t0);
  }

  window.SoundFX = {
    unlock: ensure,
    paperRustle,
    coverThud,
    chime,
    startMusic,
    stopMusic,
    toggleMusic() {
      playing ? stopMusic() : startMusic();
      return playing;
    },
    get isPlaying() { return playing; },
  };

  // Automatically start music on the very first user interaction (click/touch/key)
  function initGestureAutoplay() {
    const handleGesture = () => {
      if (!playing) {
        startMusic();
        const musicBtn = document.getElementById('music-toggle');
        if (musicBtn) {
          musicBtn.classList.add('is-playing');
          musicBtn.setAttribute('aria-pressed', 'true');
        }
      }
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('pointerdown', handleGesture);
    window.addEventListener('keydown', handleGesture);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGestureAutoplay);
  } else {
    initGestureAutoplay();
  }
})();
