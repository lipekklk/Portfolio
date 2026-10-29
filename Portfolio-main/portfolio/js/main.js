/* Ponto de entrada: monta a página na ordem correta. */
(function () {
  const P = window.Portfolio;


  function start() {
    P.renderAll(); // gera seções a partir de js/data/*
    P.initGithub(); // seção GitHub (assíncrona)
    P.initContact();
    P.initResume(); // seção Currículos: cards + modal com o PDF
    P.hydrateIcons(); // troca <i data-icon> por SVG
    P.initTheme(); // botão claro/escuro + persistência (o <head> já aplicou o tema inicial)
    document.getElementById('year').textContent = new Date().getFullYear();

    P.initLoader();
    P.initScrollEffects();
    P.initNavbar();
    P.initCursorGlow();
    P.initParticles();
    P.observeReveals();
    P.initTimelines();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
