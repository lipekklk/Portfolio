/*
 * Partículas conectadas por linhas (canvas) na hero.
 * - Quantidade proporcional à área (poucas no celular).
 * - Pausa fora da viewport e com a aba oculta.
 * - Com prefers-reduced-motion desenha só um quadro estático.
 */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const LINK_DISTANCE = 130;

  P.initParticles = function () {
    const canvas = document.getElementById('particles');
    const ctx = canvas && canvas.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = P.reducedMotion();
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = false;
    let visible = true;
    let particles = [];
    let colors = {};

    // Cores vêm das variáveis CSS do tema (css/global.css) e são relidas a cada troca de tema.
    function readColors() {
      const css = getComputedStyle(document.documentElement);
      colors = {
        line: css.getPropertyValue('--particle-line').trim() || '139, 124, 255',
        lineAlpha: parseFloat(css.getPropertyValue('--particle-line-alpha')) || 0.22,
        dot: css.getPropertyValue('--particle-dot').trim() || 'rgba(190,182,255,0.7)',
        dotStrong: css.getPropertyValue('--particle-dot-strong').trim() || 'rgba(56,217,255,0.85)',
      };
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            ctx.strokeStyle = 'rgba(' + colors.line + ',' + colors.lineAlpha * (1 - dist / LINK_DISTANCE) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.fillStyle = p.r > 1.3 ? colors.dotStrong : colors.dot;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function step() {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
    }

    function loop() {
      step();
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(64, Math.max(16, (width * height) / 24000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.5 + 0.5,
      }));
      draw();
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    window.addEventListener('themechange', () => {
      readColors();
      draw(); // redesenha já (importante quando a animação está pausada/reduzida)
    });

    readColors();
    resize();
    start();
  };
})();
