/* Utilitários compartilhados. Tudo fica no namespace window.Portfolio. */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});

  /** Escapa texto antes de inserir em innerHTML (evita injeção a partir dos arquivos de dados). */
  P.esc = (value) =>
    String(value == null ? '' : value).replace(/[&<>"']/g, (char) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });

  P.$ = (selector, root = document) => root.querySelector(selector);
  P.$$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  P.reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Brilho sutil que segue o cursor dentro de qualquer elemento .spotlight (delegação, sem re-render). */
  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType === 'touch') return;
      const el = event.target.closest && event.target.closest('.spotlight');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mx', event.clientX - rect.left + 'px');
      el.style.setProperty('--my', event.clientY - rect.top + 'px');
    },
    { passive: true },
  );
})();
