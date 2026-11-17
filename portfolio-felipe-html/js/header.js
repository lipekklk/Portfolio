/*
 * Cabeçalho: menu mobile, esconder ao descer / mostrar ao subir,
 * item ativo conforme a seção na tela e rolagem por âncoras.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  var header;
  var toggle;
  var menu;
  var isOpen = false;

  function setOpen(open) {
    if (open === isOpen) return;
    isOpen = open;

    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    document.documentElement.classList.toggle('menu-open', open);

    if (open) {
      if (FP.lenis) FP.lenis.stop();
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      if (FP.lenis) FP.lenis.start();
      header.classList.remove('is-hidden');
      toggle.focus();
    }
  }

  /** Fecha o menu mobile. Retorna true se ele estava aberto. */
  FP.closeMenu = function () {
    var wasOpen = isOpen;
    if (wasOpen) setOpen(false);
    return wasOpen;
  };

  /** Copia os links do menu principal para o menu mobile e para o rodapé. */
  function cloneLinks() {
    var source = document.querySelectorAll('#nav-principal a');
    var menuList = menu.querySelector('ul');
    var footerList = document.getElementById('nav-rodape');

    source.forEach(function (link, index) {
      var href = link.getAttribute('href');
      var label = link.textContent;

      var menuItem = FP.el('li', null, [FP.el('a', { href: href, text: label })]);
      menuItem.style.setProperty('--i', index);
      menuList.append(menuItem);

      if (footerList && href !== '#inicio') {
        footerList.append(FP.el('li', null, [FP.el('a', { href: href, text: label })]));
      }
    });
  }

  /** Esconde o cabeçalho ao descer e mostra ao subir. */
  function bindHideOnScroll() {
    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      if (!isOpen) {
        if (y > 140 && y > lastY + 6) header.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 140) header.classList.remove('is-hidden');
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
  }

  /** Marca o link da seção que cruza o centro da tela. */
  function bindActiveSection() {
    var ids = Array.prototype.map.call(document.querySelectorAll('#nav-principal a'), function (link) {
      return link.getAttribute('href').slice(1);
    });
    var sections = ids
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    function mark(activeId) {
      document.querySelectorAll('#nav-principal a, #menu-mobile a').forEach(function (link) {
        if (link.getAttribute('href') === '#' + activeId) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) mark(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach(function (section) { observer.observe(section); });
    mark('inicio');
  }

  /** Todos os links "#secao" rolam suavemente (Lenis) até a seção. */
  function bindAnchors() {
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target.closest && event.target.closest('a[href^="#"]');
      if (!link || link.classList.contains('skip-link')) return;

      var id = link.getAttribute('href').slice(1);
      if (!id || !document.getElementById(id)) return;

      event.preventDefault();
      var wasOpen = FP.closeMenu();
      // Espera o menu liberar a rolagem antes de navegar.
      if (wasOpen) window.setTimeout(function () { FP.scrollToId(id); }, 60);
      else FP.scrollToId(id);
    });
  }

  FP.initHeader = function () {
    header = document.getElementById('topo-header');
    toggle = header.querySelector('.hdr__toggle');
    menu = document.getElementById('menu-mobile');

    cloneLinks();
    bindHideOnScroll();
    bindActiveSection();
    bindAnchors();

    toggle.addEventListener('click', function () { setOpen(!isOpen); });
    window.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') FP.closeMenu();
    });

    // Fecha o menu ao voltar para telas largas.
    var wide = window.matchMedia('(min-width: 1180px)');
    wide.addEventListener('change', function () {
      if (wide.matches) FP.closeMenu();
    });
  };
})();
