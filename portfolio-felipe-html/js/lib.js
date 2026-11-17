/*
 * Utilitários compartilhados. Todos os scripts usam o objeto global `FP`
 * (sem módulos ES, para o site abrir direto do arquivo, sem servidor).
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  FP.config = Object.assign(
    { githubUser: '', linkedin: '', email: '', whatsapp: '', whatsappMensagem: '', projetos: {}, formEndpoint: '' },
    window.SITE_CONFIG || {},
  );

  /** Instância do Lenis quando a rolagem suave está ativa. */
  FP.lenis = null;

  FP.prefersReducedMotion = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  FP.hasGsap = function () {
    return typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  };

  /** Cria um elemento com segurança (nunca usa innerHTML com dados externos). */
  FP.el = function (tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        var value = props[key];
        if (value === undefined || value === null || value === false) return;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else node.setAttribute(key, value === true ? '' : value);
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.append(child);
    });
    return node;
  };

  /** Rola até uma seção pelo id, usando o Lenis quando ativo. */
  FP.scrollToId = function (id) {
    var target = document.getElementById(id);
    if (!target) return;
    history.replaceState(null, '', '#' + id);
    if (FP.lenis) FP.lenis.scrollTo(target, { duration: 1.4, force: true });
    else target.scrollIntoView({ behavior: 'auto', block: 'start' });
  };

  FP.scrollToTop = function () {
    if (FP.lenis) FP.lenis.scrollTo(0, { duration: 1.4, force: true });
    else window.scrollTo({ top: 0 });
  };

  /** Recalcula as posições do ScrollTrigger (use depois que o conteúdo mudar de altura). */
  FP.refreshScroll = function () {
    if (FP.hasGsap()) window.requestAnimationFrame(function () { window.ScrollTrigger.refresh(); });
  };

  /** Endereço do WhatsApp (wa.me) com a mensagem pronta; '' se o número não estiver configurado. */
  FP.whatsappUrl = function (message) {
    var phone = String(FP.config.whatsapp || '').replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 15) return '';
    return 'https://wa.me/' + phone + (message ? '?text=' + encodeURIComponent(message) : '');
  };

  /** True quando o site está aberto localmente (arquivo, localhost, rede local): lá não existe Netlify Forms. */
  FP.isLocalPreview = function () {
    var host = location.hostname;
    return (
      location.protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '[::1]' ||
      /\.(local|test|localhost)$/.test(host) ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
    );
  };

  /** Links de contato montados a partir de js/config.js. */
  FP.socialLinks = function () {
    var links = [];
    var cfg = FP.config;
    if (cfg.email) links.push({ label: 'E-mail', href: 'mailto:' + cfg.email, external: false });
    var whatsapp = FP.whatsappUrl(cfg.whatsappMensagem);
    if (whatsapp) links.push({ label: 'WhatsApp', href: whatsapp, external: true });
    if (cfg.githubUser) {
      links.push({
        label: 'GitHub',
        href: 'https://github.com/' + encodeURIComponent(cfg.githubUser),
        external: true,
      });
    }
    if (cfg.linkedin && /^https?:\/\//i.test(cfg.linkedin)) {
      links.push({ label: 'LinkedIn', href: cfg.linkedin, external: true });
    }
    return links;
  };

  FP.renderSocial = function () {
    var links = FP.socialLinks();
    document.querySelectorAll('[data-social]').forEach(function (list) {
      list.replaceChildren();
      if (links.length === 0) {
        list.hidden = true;
        return;
      }
      list.hidden = false;
      links.forEach(function (item) {
        var attrs = { href: item.href, text: item.label };
        if (item.external) {
          attrs.target = '_blank';
          attrs.rel = 'noopener noreferrer';
        }
        list.append(FP.el('li', null, [FP.el('a', attrs)]));
      });
    });
  };

  /** Atração magnética dos botões (só com mouse e sem preferência por menos movimento). */
  FP.bindMagnets = function (root) {
    if (!FP.hasGsap()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    (root || document).querySelectorAll('.btn-magnet:not([data-magnet])').forEach(function (el) {
      el.setAttribute('data-magnet', '');
      var moveX = null;
      var moveY = null;

      el.addEventListener('pointermove', function (event) {
        if (FP.prefersReducedMotion() || el.querySelector('.btn:disabled')) return;
        if (!moveX) {
          moveX = window.gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
          moveY = window.gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
        }
        var rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * 0.28);
        moveY((event.clientY - (rect.top + rect.height / 2)) * 0.28);
      });
      el.addEventListener('pointerleave', function () {
        if (moveX) {
          moveX(0);
          moveY(0);
        }
      });
    });
  };

  /** Brilho dos cartões ".spot" que segue o ponteiro (só CSS variables). */
  FP.bindSpotlight = function () {
    document.addEventListener(
      'pointermove',
      function (event) {
        var card = event.target.closest && event.target.closest('.spot');
        if (!card) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', event.clientX - rect.left + 'px');
        card.style.setProperty('--my', event.clientY - rect.top + 'px');
      },
      { passive: true },
    );
  };
})();
