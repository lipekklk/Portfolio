/* Interações de interface: loader, navbar, scroll, reveal, timeline, cursor. */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const { icon, $, $$ } = P;

  /* ---------- Loader (ignorado com prefers-reduced-motion) ---------- */
  P.initLoader = function () {
    const loader = $('#loader');
    if (!loader) return;
    if (P.reducedMotion()) return loader.remove();
    setTimeout(() => loader.setAttribute('data-phase', 'hide'), 750);
    setTimeout(() => loader.remove(), 1300);
  };

  /* ---------- Scroll: um único listener com rAF, publicando variáveis CSS no <html> ---------- */
  P.initScrollEffects = function () {
    const root = document.documentElement;
    let ticking = false;

    function update() {
      ticking = false;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--scroll-progress', String(max > 0 ? Math.min(1, y / max) : 0));
      root.style.setProperty('--scroll-y', P.reducedMotion() ? '0' : String(Math.min(y, 3000))); // parallax sutil
      root.toggleAttribute('data-scrolled', y > 24); // navbar compacta
      root.toggleAttribute('data-show-top', y > 700); // botão voltar ao topo
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  };

  /* ---------- Navbar: menu mobile + item ativo ---------- */
  P.initNavbar = function () {
    const navbar = $('#navbar');
    const toggle = $('#nav-toggle');
    const slot = $('[data-icon-slot]', toggle);
    let previousOverflow = '';

    function setOpen(open) {
      navbar.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      slot.innerHTML = icon(open ? 'close' : 'menu');
      if (open) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = previousOverflow;
      }
    }
    const isOpen = () => navbar.getAttribute('data-open') === 'true';

    toggle.addEventListener('click', () => setOpen(!isOpen()));
    $$('#menu-principal a, .brand', navbar).forEach((link) => link.addEventListener('click', () => isOpen() && setOpen(false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && isOpen()) setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900 && isOpen()) setOpen(false); });

    // Qual item da navbar fica ativo em cada seção (Jornada e GitHub herdam o vizinho).
    const navFor = { inicio: 'inicio', sobre: 'sobre', skills: 'skills', projetos: 'projetos', certificados: 'certificados', formacao: 'formacao', jornada: 'formacao', curriculo: 'curriculo', github: 'contato', contato: 'contato' };
    const links = $$('.navbar__link', navbar);
    function setActive(sectionId) {
      const target = navFor[sectionId];
      links.forEach((link) => {
        if (link.getAttribute('data-nav') === target) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
    setActive('inicio');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
        { rootMargin: '-45% 0px -50% 0px' },
      );
      $$('[data-section]').forEach((section) => observer.observe(section));
    }
  };

  /* ---------- Scroll reveal (fade + slide-up) e preenchimento das timelines ---------- */
  let revealObserver;
  P.observeReveals = function (root) {
    const scope = root || document;
    const items = $$('.reveal:not(.is-visible)', scope);
    if (!('IntersectionObserver' in window)) return items.forEach((el) => el.classList.add('is-visible'));
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }),
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );
    }
    items.forEach((el) => revealObserver.observe(el));
  };

  P.initTimelines = function () {
    const timelines = $$('.timeline');
    if (!('IntersectionObserver' in window)) return timelines.forEach((el) => el.style.setProperty('--fill', el.dataset.fill));
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.setProperty('--fill', entry.target.dataset.fill);
          observer.unobserve(entry.target);
        }),
      { threshold: 0.1 },
    );
    timelines.forEach((el) => observer.observe(el));
  };

  /* ---------- Brilho discreto que acompanha o cursor (só com mouse) ---------- */
  P.initCursorGlow = function () {
    const el = $('#cursor-glow');
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!el || !fine || P.reducedMotion()) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    window.addEventListener(
      'pointermove',
      (event) => {
        x = event.clientX;
        y = event.clientY;
        el.setAttribute('data-active', 'true');
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; });
      },
      { passive: true },
    );
    document.documentElement.addEventListener('pointerleave', () => el.setAttribute('data-active', 'false'));
  };
})();
