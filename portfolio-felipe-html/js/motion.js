/*
 * Animações: GSAP + ScrollTrigger + Lenis.
 *
 * Tudo roda dentro de um único gsap.matchMedia():
 *  - com prefers-reduced-motion, NADA é criado (sem Lenis, sem animações, sem divisão de texto);
 *  - se a preferência mudar ou a tela cruzar 900px, o GSAP desfaz tudo (revert) e refaz;
 *  - se a CDN falhar (sem window.gsap), o site simplesmente fica estático.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  /* ---------------------------------------------------------------- */
  /* Rolagem suave (Lenis acoplado ao ticker do GSAP)                  */
  /* ---------------------------------------------------------------- */

  function smoothScroll() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (typeof window.Lenis === 'undefined') return null;

    var lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      syncTouch: false, // no celular a rolagem continua nativa
    });
    FP.lenis = lenis;

    // O Lenis avança a cada frame do GSAP (um único loop) e avisa o ScrollTrigger.
    var onScroll = function () { ScrollTrigger.update(); };
    lenis.on('scroll', onScroll);
    var raf = function (time) { lenis.raf(time * 1000); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    var refresh = function () { ScrollTrigger.refresh(); };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);

    return function () {
      window.removeEventListener('load', refresh);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      FP.lenis = null;
    };
  }

  /* ---------------------------------------------------------------- */
  /* Divisão de texto (títulos em máscara, parágrafo palavra a palavra) */
  /* ---------------------------------------------------------------- */

  function splitText() {
    var restores = [];

    // Títulos: cada palavra dentro de uma máscara; o texto completo vai no aria-label.
    document.querySelectorAll('[data-split]').forEach(function (heading) {
      var original = heading.innerHTML;
      var hadLabel = heading.hasAttribute('aria-label');
      var text = heading.textContent.replace(/\s+/g, ' ').trim();
      var words = text.split(' ');

      heading.replaceChildren();
      heading.setAttribute('aria-label', text);
      words.forEach(function (word, index) {
        var mask = FP.el('span', { class: 'split__mask', 'aria-hidden': 'true' }, [
          FP.el('span', { class: 'split__word', text: word }),
        ]);
        heading.append(mask);
        if (index < words.length - 1) heading.append(' ');
      });

      restores.push(function () {
        heading.innerHTML = original;
        if (!hadLabel) heading.removeAttribute('aria-label');
      });
    });

    // Parágrafos que acendem com a rolagem.
    document.querySelectorAll('[data-scrub-words]').forEach(function (paragraph) {
      var original = paragraph.innerHTML;
      var words = paragraph.textContent.replace(/\s+/g, ' ').trim().split(' ');
      paragraph.replaceChildren();
      words.forEach(function (word, index) {
        paragraph.append(FP.el('span', { class: 'sw', text: word }));
        if (index < words.length - 1) paragraph.append(' ');
      });
      restores.push(function () { paragraph.innerHTML = original; });
    });

    return function () { restores.forEach(function (restore) { restore(); }); };
  }

  /* ---------------------------------------------------------------- */
  /* Nome do hero: peso da fonte varia com a proximidade do ponteiro   */
  /* ---------------------------------------------------------------- */

  var BASE_WEIGHT = 420;
  var MAX_WEIGHT = 820;
  var BASE_WIDTH = 100;
  var MIN_WIDTH = 80;
  var RADIUS = 260;
  var SMOOTHING = 0.14;

  function variableProximity(withPointer) {
    var root = document.querySelector('.vp');
    if (!root) return null;

    var originals = [];
    root.querySelectorAll('[data-vp-line]').forEach(function (line) {
      var text = line.textContent;
      originals.push([line, line.textContent]);
      line.setAttribute('aria-hidden', 'true');
      line.replaceChildren();
      Array.from(text).forEach(function (char) {
        line.append(FP.el('span', { class: 'vp__char', text: char }));
      });
    });

    var chars = Array.from(root.querySelectorAll('.vp__char'));
    var removePointer = null;

    if (withPointer) {
      var current = chars.map(function () { return 0; });
      var pointerX = -9999;
      var pointerY = -9999;
      var active = false;
      var visible = true;
      var frame = 0;

      var setting = function (weight, width) {
        return '"wght" ' + weight.toFixed(0) + ', "wdth" ' + width.toFixed(1) + ', "opsz" 96';
      };

      var tick = function () {
        var moving = false;
        chars.forEach(function (char, index) {
          var target = 0;
          if (active) {
            var rect = char.getBoundingClientRect();
            var distance = Math.hypot(
              pointerX - (rect.left + rect.width / 2),
              pointerY - (rect.top + rect.height / 2),
            );
            var closeness = Math.max(0, 1 - distance / RADIUS);
            target = closeness * closeness;
          }
          current[index] += (target - current[index]) * SMOOTHING;
          if (Math.abs(target - current[index]) > 0.004) moving = true;
          var k = current[index];
          char.style.fontVariationSettings = setting(
            BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * k,
            BASE_WIDTH - (BASE_WIDTH - MIN_WIDTH) * k,
          );
        });
        frame = moving || active ? window.requestAnimationFrame(tick) : 0;
      };

      var start = function () { if (!frame) frame = window.requestAnimationFrame(tick); };
      var onMove = function (event) {
        if (!visible) return;
        pointerX = event.clientX;
        pointerY = event.clientY;
        active = true;
        start();
      };
      var onLeave = function () { active = false; start(); };

      var observer = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (!visible) onLeave();
      });
      observer.observe(root);
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);

      removePointer = function () {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        observer.disconnect();
        if (frame) window.cancelAnimationFrame(frame);
      };
    }

    return function () {
      if (removePointer) removePointer();
      originals.forEach(function (pair) {
        pair[0].replaceChildren(document.createTextNode(pair[1]));
        pair[0].removeAttribute('aria-hidden');
      });
    };
  }

  /* ---------------------------------------------------------------- */
  /* Animações de rolagem                                              */
  /* ---------------------------------------------------------------- */

  function revealHeadings(gsap) {
    gsap.utils.toArray('[data-split]').forEach(function (heading) {
      var words = heading.querySelectorAll('.split__word');
      if (!words.length) return;
      gsap.from(words, {
        yPercent: 118,
        rotate: 2.5,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.07,
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
      });
    });
  }

  function scrubWords(gsap) {
    gsap.utils.toArray('[data-scrub-words]').forEach(function (paragraph) {
      var words = paragraph.querySelectorAll('.sw');
      if (!words.length) return;
      gsap.from(words, {
        opacity: 0.16,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: paragraph, start: 'top 82%', end: 'bottom 52%', scrub: true },
      });
    });
  }

  function drawLines(gsap) {
    gsap.utils.toArray('[data-line]').forEach(function (line) {
      gsap.from(line, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: { trigger: line, start: 'top 94%', once: true },
      });
    });
  }

  function parallax(gsap) {
    gsap.utils.toArray('[data-speed]').forEach(function (el) {
      var speed = parseFloat(el.dataset.speed || '0');
      var section = el.closest('.section') || el;
      var isFirst = section.classList.contains('section--first');
      gsap.to(el, {
        y: function () { return speed * -180; },
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: isFirst ? 'top top' : 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }

  /** Cada seção recua em profundidade enquanto a próxima "folha" a cobre. */
  function sectionDepth(gsap) {
    gsap.utils.toArray('main .section[data-depth]').forEach(function (section) {
      if (section.hidden) return;
      var next = section.nextElementSibling;
      while (next && next.hidden) next = next.nextElementSibling;
      var inner = section.querySelector('.section__inner');
      if (!next || !inner) return;
      gsap.to(inner, {
        scale: 0.94,
        opacity: 0.3,
        yPercent: -2,
        transformOrigin: '50% 100%',
        ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 12%', scrub: true },
      });
    });
  }

  function projectImages(gsap) {
    gsap.utils.toArray('.project__media').forEach(function (media) {
      var img = media.querySelector('img');
      if (!img) return;
      gsap.fromTo(
        img,
        { yPercent: -8, scale: 1.18 },
        {
          yPercent: 8,
          scale: 1.18,
          ease: 'none',
          scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  }

  function aboutPhoto(gsap) {
    var frame = document.querySelector('.portrait__frame');
    var image = document.querySelector('.portrait__img');
    if (!frame) return;

    gsap.from(frame, {
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 1.4,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
    });
    if (image) {
      gsap.fromTo(
        image,
        { yPercent: -7, scale: 1.2 },
        {
          yPercent: 7,
          scale: 1.2,
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  }

  function hero(gsap) {
    var root = document.getElementById('inicio');
    if (!root) return;

    // Entrada: uma única sequência orquestrada.
    var intro = gsap.timeline({ defaults: { ease: 'power4.out' }, paused: true });
    intro
      .from(root.querySelectorAll('.vp__char'), { yPercent: 118, duration: 1.2, stagger: 0.055 })
      .from(root.querySelectorAll('.hero__fade'), { opacity: 0, y: 26, duration: 0.9, stagger: 0.09 }, '-=0.75')
      .from(
        root.querySelectorAll('.code__line'),
        { opacity: 0, x: -16, duration: 0.5, stagger: 0.07, ease: 'power2.out' },
        '-=0.8',
      );

    // Espera a fonte carregar (no máximo 1,2 s) para a entrada não acontecer com a fonte reserva.
    var fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
    Promise.race([
      fontsReady,
      new Promise(function (resolve) { window.setTimeout(resolve, 1200); }),
    ]).then(function () { intro.play(); });

    // Rolagem: nome e cartão andam em velocidades diferentes.
    var name = root.querySelector('.vp');
    var card = root.querySelector('.hero__card');
    var scrollTrigger = { trigger: root, start: 'top top', end: 'bottom top', scrub: true };
    if (name) gsap.to(name, { yPercent: -14, ease: 'none', scrollTrigger: scrollTrigger });
    if (card) gsap.to(card, { y: -90, ease: 'none', scrollTrigger: scrollTrigger });
  }

  function contact(gsap) {
    var root = document.querySelector('#contato .contact');
    if (!root) return;
    gsap.from(root.querySelectorAll('.contact__fade'), {
      opacity: 0,
      y: 30,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: root, start: 'top 70%', once: true },
    });
  }

  /**
   * "Minha Jornada": em telas largas a seção fica fixa (pin) enquanto a linha
   * se desenha e os próximos passos acendem. Em telas pequenas vira leitura vertical.
   */
  function journey(gsap, wide) {
    var root = document.getElementById('jornada');
    if (!root) return;

    if (wide) {
      var line = root.querySelector('.journey__line');
      var stage = root.querySelector('.journey__stage');
      if (!stage || !line) return;
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: '+=130%',
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        })
        .from(line, { scaleX: 0, transformOrigin: 'left center', duration: 1.4 })
        .from(root.querySelector('.journey__next-title'), { opacity: 0.15, duration: 0.5 }, 0.8)
        .from(root.querySelectorAll('.journey__next li'), { opacity: 0.12, x: 28, duration: 0.6, stagger: 0.45 }, 1);
    } else {
      gsap.from(root.querySelectorAll('.journey__now li, .journey__next li'), {
        opacity: 0.15,
        y: 24,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: root.querySelector('.journey__cols'), start: 'top 80%', once: true },
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Ponto de entrada                                                  */
  /* ---------------------------------------------------------------- */

  FP.initMotion = function () {
    if (!FP.hasGsap()) return; // CDN indisponível: o site fica estático, mas completo.

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    // Evita recalcular tudo quando a barra de endereço do celular aparece/some.
    window.ScrollTrigger.config({ ignoreMobileResize: true });

    FP.bindMagnets(document);

    var mm = gsap.matchMedia();
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        wide: '(min-width: 900px)',
        fine: '(hover: hover) and (pointer: fine)',
      },
      function (context) {
        var conditions = context.conditions;
        if (!conditions.motion) return undefined;

        var cleanups = [smoothScroll(), splitText(), variableProximity(conditions.fine)];

        hero(gsap);
        revealHeadings(gsap);
        scrubWords(gsap);
        drawLines(gsap);
        parallax(gsap);
        aboutPhoto(gsap);
        projectImages(gsap);
        journey(gsap, conditions.wide);
        contact(gsap);
        sectionDepth(gsap);

        return function () {
          cleanups.forEach(function (cleanup) { if (cleanup) cleanup(); });
        };
      },
    );
  };
})();
