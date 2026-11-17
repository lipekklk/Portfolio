/* Ponto de entrada: liga tudo na ordem certa. */
(function () {
  'use strict';

  var FP = window.FP;

  /**
   * Cada seção visível recebe um tema (cobalto, gelo ou índigo).
   * Os temas alternam entre gelo e índigo; "Jornada" e "Contato" preferem cobalto.
   * Seções ocultas (ex.: GitHub sem usuário) não entram na conta.
   */
  function applyThemes() {
    var previous = 'blue'; // o hero é cobalto
    document.querySelectorAll('main > .section:not(.hero)').forEach(function (section) {
      if (section.hidden) return;
      var prefer = section.dataset.prefer;
      var theme;
      if (prefer) theme = prefer !== previous ? prefer : 'ice';
      else theme = previous === 'ice' ? 'ink' : 'ice';
      section.dataset.theme = theme;
      previous = theme;
    });
  }

  function start() {
    FP.renderSocial();
    FP.initGithub(); // pode mostrar a seção GitHub, então vem antes dos temas
    applyThemes();

    document.querySelectorAll('[data-year]').forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
    document.getElementById('voltar-topo').addEventListener('click', FP.scrollToTop);

    FP.initProjects(); // botões de projeto vêm do config.js
    FP.initViewer();
    FP.initHeader();
    FP.initContact();
    FP.bindSpotlight();
    FP.initMotion(); // por último: depende do HTML já estar no estado final
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
