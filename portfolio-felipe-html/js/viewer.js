/*
 * Visualizador (janela <dialog>) para certificados (imagem) e currículos (PDF).
 * Links com data-viewer="image" | "pdf" abrem aqui; sem JS (ou sem suporte) o link
 * continua abrindo o arquivo em nova aba.
 * PDF: só na janela em telas largas com mouse; no celular o navegador abre o PDF em nova aba,
 * porque a maioria dos celulares não mostra PDF dentro de uma página.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  function canShowPdfInline() {
    return (
      window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches &&
      navigator.pdfViewerEnabled !== false
    );
  }

  FP.initViewer = function () {
    var dialog = document.getElementById('visualizador');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var title = document.getElementById('visualizador-titulo');
    var body = document.getElementById('visualizador-corpo');
    var openNew = document.getElementById('visualizador-nova');
    var download = document.getElementById('visualizador-baixar');

    function open(href, kind, label) {
      title.textContent = label;
      openNew.href = href;
      download.href = href;
      download.setAttribute('download', '');

      var content;
      if (kind === 'pdf') {
        content = FP.el('iframe', { class: 'viewer__pdf', src: href, title: label });
      } else {
        content = FP.el('img', { class: 'viewer__img', src: href, alt: label });
      }
      body.replaceChildren(content);
      dialog.dataset.kind = kind;

      document.documentElement.classList.add('viewer-open');
      if (FP.lenis) FP.lenis.stop();
      dialog.showModal();
      document.getElementById('visualizador-fechar').focus();
    }

    // O foco volta sozinho para o botão que abriu a janela (comportamento nativo do <dialog>).
    dialog.addEventListener('close', function () {
      body.replaceChildren();
      document.documentElement.classList.remove('viewer-open');
      if (FP.lenis) FP.lenis.start();
    });

    document.getElementById('visualizador-fechar').addEventListener('click', function () { dialog.close(); });

    // Clique fora do conteúdo (no fundo escuro) fecha.
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target.closest && event.target.closest('a[data-viewer]');
      if (!link) return;

      var kind = link.dataset.viewer;
      if (kind === 'pdf' && !canShowPdfInline()) return; // abre em nova aba (comportamento padrão)

      event.preventDefault();
      open(link.href, kind, link.dataset.title || link.textContent.trim());
    });
  };
})();
