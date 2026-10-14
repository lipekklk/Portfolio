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

  /**
   * Modal acessível compartilhado (certificados e currículos). Usa as classes .modal* de sections.css.
   *  - Trava o scroll do fundo sem mudar a posição da página (ao fechar, volta exatamente onde estava).
   *  - Esc, clique fora ou botão .modal__close fecham; o foco fica preso no modal e volta para quem abriu.
   *  - No celular, o botão "voltar" fecha o modal em vez de sair do site.
   * @param {string} panelHtml  HTML completo do .modal__panel
   * @param {{opener?: Element, onClose?: Function}} [options]
   * @returns {{ modal: HTMLElement, close: Function }}
   */
  P.openModal = function (panelHtml, options) {
    const opts = options || {};
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = panelHtml;

    const body = document.body;
    const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = scrollbar + 'px'; // evita "pulo" lateral do layout
    body.appendChild(modal);

    let closed = false;
    let pushed = false;
    try {
      history.pushState({ portfolioModal: true }, '');
      pushed = true;
    } catch (e) { /* sem History API: fecha só pelos controles */ }

    const focusable = () => P.$$('a[href], button:not([disabled]), iframe', modal);
    function close(fromHistory) {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      modal.remove();
      if (pushed && fromHistory !== true) history.back(); // remove a entrada criada ao abrir
      if (opts.onClose) opts.onClose();
      if (opts.opener) opts.opener.focus({ preventScroll: true });
    }
    function onPop() {
      close(true);
    }
    function onKey(event) {
      if (event.key === 'Escape') return close();
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    modal.addEventListener('mousedown', (event) => { if (event.target === modal) close(); });
    P.$$('.modal__close', modal).forEach((button) => button.addEventListener('click', () => close()));
    document.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
    const first = P.$('.modal__close', modal) || focusable()[0];
    if (first) first.focus({ preventScroll: true });
    return { modal, close };
  };

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
