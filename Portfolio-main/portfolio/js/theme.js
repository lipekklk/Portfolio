/*
 * Tema claro/escuro.
 *
 * Ordem de decisão:
 *   1. Escolha manual salva no localStorage ('portfolio-theme').
 *   2. Preferência do sistema operacional (prefers-color-scheme).
 *   3. Escuro (identidade original do site).
 *
 * O <head> do index.html já aplica data-theme ANTES da primeira pintura
 * (evita o "flash" de tema errado). Este módulo cuida do botão, da
 * persistência, da animação de troca e de acompanhar o sistema operacional
 * enquanto a pessoa não tiver escolhido um tema manualmente.
 *
 * Quem precisar reagir à troca (ex.: canvas de partículas) escuta:
 *   window.addEventListener('themechange', (e) => e.detail.theme)
 */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const STORAGE_KEY = 'portfolio-theme';
  const THEMES = ['light', 'dark'];
  const META_COLOR = { dark: '#06070b', light: '#f5f6fb' };
  const root = document.documentElement;
  const systemLight = window.matchMedia('(prefers-color-scheme: light)');

  function readStored() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return THEMES.includes(value) ? value : null;
    } catch (e) {
      return null; // modo privado / storage bloqueado: segue sem persistir
    }
  }
  function writeStored(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) { /* sem persistência, mas o tema ainda troca */ }
  }

  const systemTheme = () => (systemLight.matches ? 'light' : 'dark');
  P.getTheme = () => (THEMES.includes(root.getAttribute('data-theme')) ? root.getAttribute('data-theme') : readStored() || systemTheme());

  /** Aplica o tema no DOM (sem animação). */
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLOR[theme]);

    const button = document.getElementById('theme-toggle');
    if (button) {
      const label = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(theme === 'light'));
    }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }

  /**
   * Troca o tema com transição.
   * - Com View Transitions API: círculo que se expande a partir do botão.
   * - Sem ela: transição de cores via classe .theme-switching (css/global.css).
   * - Com prefers-reduced-motion: troca instantânea.
   */
  P.setTheme = function (theme, origin) {
    if (!THEMES.includes(theme) || theme === P.getTheme()) return;

    if (P.reducedMotion()) return apply(theme);

    if (document.startViewTransition) {
      const x = origin ? origin.x : window.innerWidth / 2;
      const y = origin ? origin.y : 0;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const transition = document.startViewTransition(() => apply(theme));
      transition.ready
        .then(() =>
          root.animate(
            { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
          ),
        )
        .catch(() => {});
      return;
    }

    root.classList.add('theme-switching');
    apply(theme);
    clearTimeout(P.setTheme.timer);
    P.setTheme.timer = setTimeout(() => root.classList.remove('theme-switching'), 450);
  };

  P.initTheme = function () {
    apply(P.getTheme()); // sincroniza botão/meta com o que o <head> já aplicou

    const button = document.getElementById('theme-toggle');
    if (button) {
      button.addEventListener('click', () => {
        const next = P.getTheme() === 'dark' ? 'light' : 'dark';
        const rect = button.getBoundingClientRect();
        writeStored(next); // escolha manual passa a ter prioridade sobre o sistema
        P.setTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      });
    }

    // Segue o sistema operacional enquanto não houver escolha manual.
    systemLight.addEventListener('change', () => {
      if (!readStored()) P.setTheme(systemTheme());
    });

    // Mantém abas abertas do site sincronizadas.
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) P.setTheme(THEMES.includes(event.newValue) ? event.newValue : systemTheme());
    });
  };
})();
