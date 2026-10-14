/*
 * Seção Currículos: cards gerados a partir de js/data/resumes.js + modal com o PDF.
 *
 *  - Os PDFs NÃO são carregados na página: o <iframe> só é criado quando o visitante
 *    clica em "Visualizar" (modal via P.openModal, em js/utils.js).
 *  - Fechar o modal devolve o visitante exatamente à mesma posição da página.
 *  - Arquivo inexistente → card "Em breve" com botões desativados (nada de link quebrado).
 *  - iPhone/Android não exibem PDF dentro de páginas: nesses aparelhos o modal mostra
 *    "Abrir em nova aba" e "Baixar" no lugar do visualizador.
 *  - "Baixar" usa <a download>: o navegador baixa o arquivo original, sem conversão.
 */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const { esc, icon, $, $$ } = P;

  const fileNameOf = (path) => decodeURIComponent(String(path).split('#')[0].split('?')[0].split('/').pop() || 'curriculo.pdf');

  /** 'ok' | 'missing' | 'unknown' (ex.: aberto via file://, onde fetch não funciona → assume que existe). */
  async function checkPdf(src) {
    try {
      const response = await fetch(src, { method: 'HEAD', cache: 'no-store' });
      if (!response.ok) return 'missing';
      // Alguns hosts devolvem 200 com uma página HTML no lugar de arquivos inexistentes.
      const type = response.headers.get('content-type') || '';
      return type && !/pdf|octet-stream/i.test(type) ? 'missing' : 'ok';
    } catch (e) {
      return 'unknown';
    }
  }

  /** iPhone/iPad mostram só a 1ª página em iframes; Android não renderiza PDF embutido. */
  function canEmbedPdf() {
    const ua = navigator.userAgent;
    const iOS = /iP(hone|od|ad)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    return !iOS && navigator.pdfViewerEnabled !== false;
  }

  /* ---------- Cards ---------- */
  function resumeCard(resume, index) {
    const src = String(resume.arquivo || '').trim();
    const tags = (resume.tags || []).filter(Boolean);
    return (
      '<li class="resume-card glass spotlight reveal" style="--delay:' + (index % 3) * 90 + 'ms" data-state="' + (src ? 'ready' : 'missing') + '">' +
      '<div class="resume-card__head">' +
      '<span class="resume-card__icon">' + icon('file', 22) + '</span>' +
      '<span class="resume-card__badge tag tag--mono">PDF</span>' +
      '<span class="resume-card__soon tag tag--warn">Em breve</span>' +
      '</div>' +
      '<h3 class="resume-card__title">' + esc(resume.titulo) + '</h3>' +
      (resume.descricao ? '<p class="resume-card__desc">' + esc(resume.descricao) + '</p>' : '') +
      (tags.length
        ? '<ul class="resume-card__tags" aria-label="Foco do currículo">' +
          tags.map((t) => '<li><span class="tag tag--accent">' + esc(t) + '</span></li>').join('') + '</ul>'
        : '') +
      (resume.atualizado ? '<p class="resume-card__date">' + icon('calendar', 15) + 'Atualizado em ' + esc(resume.atualizado) + '</p>' : '') +
      '<div class="resume-card__actions">' +
      '<button type="button" class="btn btn--primary btn--sm" data-resume="' + index + '" aria-label="Visualizar ' + esc(resume.titulo) + '">' +
      icon('eye', 16) + ' Visualizar currículo</button>' +
      '<a class="btn btn--ghost btn--sm resume-card__download" href="' + esc(src) + '" download="' + esc(fileNameOf(src)) + '" aria-label="Baixar ' +
      esc(resume.titulo) + ' (PDF)" title="Baixar PDF">' + icon('download', 16) + '<span>Baixar</span></a>' +
      '</div></li>'
    );
  }

  function markMissing(card, src) {
    card.setAttribute('data-state', 'missing');
    $$('.btn', card).forEach((el) => {
      el.setAttribute('aria-disabled', 'true');
      el.classList.add('btn--disabled');
      if (el.tagName === 'BUTTON') el.disabled = true;
      else {
        el.removeAttribute('href');
        el.removeAttribute('download');
      }
      el.setAttribute('title', 'Currículo ainda não disponível');
    });
    console.info('[portfólio] Currículo não encontrado: "' + src + '". Coloque o PDF nesse caminho (veja js/data/resumes.js).');
  }

  /* ---------- Modal ---------- */
  function openResume(resume, opener) {
    const src = String(resume.arquivo || '').trim();
    const fileName = fileNameOf(src);
    const embed = canEmbedPdf();

    const viewer = embed
      ? '<div class="resume-modal__viewer" data-state="loading">' +
        '<div class="resume-modal__loading skeleton" aria-hidden="true"></div>' +
        // #view=FitH ajusta a largura da página ao espaço do modal.
        '<iframe class="resume-modal__frame" src="' + esc(src) + '#view=FitH" title="' + esc(resume.titulo) + ' (PDF)"></iframe></div>'
      : '<div class="resume-modal__fallback">' + icon('file', 34) +
        '<h4>Visualize no seu dispositivo</h4>' +
        '<p>Este aparelho não exibe PDFs dentro da página. Abra o currículo em uma nova aba (o portfólio continua aberto) ou faça o download.</p></div>';

    const { modal } = P.openModal(
      '<div class="modal__panel resume-modal" role="dialog" aria-modal="true" aria-labelledby="resume-modal-title" aria-describedby="resume-modal-desc">' +
        '<div class="modal__head">' +
        '<div class="resume-modal__heading">' +
        '<span class="resume-card__icon">' + icon('file', 20) + '</span>' +
        '<div><h3 id="resume-modal-title" class="modal__title">' + esc(resume.titulo) + '</h3>' +
        '<p id="resume-modal-desc" class="modal__sub">' + esc(resume.descricao || fileName) + '</p></div></div>' +
        '<button type="button" class="modal__close" aria-label="Fechar currículo">' + icon('close') + '</button></div>' +
        viewer +
        '<div class="modal__foot resume-modal__foot">' +
        '<a class="btn btn--ghost btn--sm" href="' + esc(src) + '" target="_blank" rel="noopener">' + icon('external', 16) + ' Abrir em nova aba</a>' +
        '<a class="btn btn--primary btn--sm" href="' + esc(src) + '" download="' + esc(fileName) + '">' + icon('download', 16) + ' Baixar currículo</a>' +
        '</div></div>',
      { opener },
    );

    const frame = $('.resume-modal__frame', modal);
    if (frame) frame.addEventListener('load', () => frame.parentElement.setAttribute('data-state', 'ready'), { once: true });
  }

  /* ---------- Inicialização ---------- */
  P.initResume = function () {
    const wrap = $('#resumes-wrap');
    if (!wrap) return;
    const resumes = (window.PORTFOLIO_DATA.resumes || []).filter((r) => r && r.titulo);

    if (!resumes.length) {
      wrap.innerHTML = '<div class="empty">' + icon('file', 32) + '<p>Nenhum currículo cadastrado ainda.</p></div>';
      return;
    }

    // Renderização síncrona (as animações de reveal são ligadas logo em seguida pelo main.js).
    wrap.innerHTML = '<ul class="resumes__grid">' + resumes.map(resumeCard).join('') + '</ul>';

    wrap.addEventListener('click', (event) => {
      const button = event.target.closest('[data-resume]');
      if (button && !button.disabled) openResume(resumes[Number(button.getAttribute('data-resume'))], button);
    });

    // Verifica os arquivos em paralelo, sem atrasar a renderização.
    const cards = $$('.resume-card', wrap);
    resumes.forEach((resume, i) => {
      const src = String(resume.arquivo || '').trim();
      if (!src) return markMissing(cards[i], '(sem caminho)');
      checkPdf(src).then((status) => { if (status === 'missing') markMissing(cards[i], src); });
    });
  };
})();
