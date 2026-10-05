/* =====================================================================
   AMBIENT PARTICLES — lightweight dust + golden bokeh
   Optimised: no text rendering, no shadowBlur, 30fps cap, fewer particles
   ===================================================================== */
(function () {
  'use strict';

  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const c = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1;
  let dust = [], bokeh = [];
  let intensity = 1;
  let targetIntensity = 1;
  let lastFrame = 0;
  const FPS_INTERVAL = 1000 / 30; // cap at 30fps

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  const rand = (a, b) => a + Math.random() * (b - a);

  function seed() {
    const area = W * H;
    const dustCount = Math.round(Math.min(40, area / 30000));
    const bokehCount = Math.round(Math.min(10, area / 120000) + 3);
    dust = Array.from({ length: dustCount }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.6, 1.8),
      vx: rand(-0.06, 0.06), vy: rand(-0.12, -0.02),
      a: rand(0.15, 0.5), tw: rand(0, Math.PI * 2), tws: rand(0.008, 0.025),
    }));
    bokeh = Array.from({ length: bokehCount }, () => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(16, 50),
      vx: rand(-0.08, 0.08), vy: rand(-0.08, 0.04),
      a: rand(0.03, 0.1), hue: rand(36, 48), ph: rand(0, Math.PI * 2),
    }));
  }

  function step(now) {
    if (!reduceMotion) requestAnimationFrame(step);

    // Throttle to 30fps
    if (now - lastFrame < FPS_INTERVAL) return;
    lastFrame = now;

    intensity += (targetIntensity - intensity) * 0.03;
    c.clearRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';

    // Bokeh orbs — simple radial gradient circles
    for (const b of bokeh) {
      b.ph += 0.003;
      b.x += b.vx + Math.sin(b.ph) * 0.05;
      b.y += b.vy;
      wrap(b, b.r);
      const alpha = b.a * intensity * (0.7 + 0.3 * Math.sin(b.ph * 2));
      if (alpha < 0.005) continue;
      const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `hsla(${b.hue}, 80%, 65%, ${alpha})`);
      g.addColorStop(1, `hsla(${b.hue}, 80%, 50%, 0)`);
      c.fillStyle = g;
      c.beginPath();
      c.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      c.fill();
    }

    // Dust specks — simple tiny circles, no text, no shadow
    c.fillStyle = `rgba(255, 220, 180, ${0.4 * intensity})`;
    for (const d of dust) {
      d.vx *= 0.99; d.vy = d.vy * 0.99 - 0.001;
      d.x += d.vx; d.y += d.vy;
      d.tw += d.tws;
      wrap(d, 4);
      const alpha = d.a * intensity * (0.5 + 0.5 * Math.sin(d.tw));
      if (alpha < 0.02) continue;
      c.globalAlpha = alpha;
      c.beginPath();
      c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }

  function wrap(p, m) {
    if (p.x < -m) p.x = W + m; else if (p.x > W + m) p.x = -m;
    if (p.y < -m) p.y = H + m; else if (p.y > H + m) p.y = -m;
  }

  window.addEventListener('resize', resize);
  resize();
  if (!reduceMotion) requestAnimationFrame(step);

  window.Particles = {
    setMode(mode) { targetIntensity = mode === 'ambient' ? 0.35 : 1; },
  };
})();
