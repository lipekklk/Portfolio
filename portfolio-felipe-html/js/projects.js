/*
 * Botões "Ver projeto" / "Ver código" e tecnologias de cada projeto,
 * preenchidos a partir de `projetos` em js/config.js. Sem dados, nada aparece.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  function isHttp(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  }

  function linkButton(label, href, variant) {
    var link = FP.el('a', {
      class: 'btn btn--' + variant + ' btn--sm',
      href: href.trim(),
      target: '_blank',
      rel: 'noopener noreferrer',
      text: label,
    });
    return FP.el('span', { class: 'btn-magnet' }, [link]);
  }

  FP.initProjects = function () {
    var data = FP.config.projetos || {};

    document.querySelectorAll('[data-project]').forEach(function (item) {
      var info = data[item.dataset.project];
      var body = item.querySelector('.project__body');
      if (!info || !body) return;

      var tags = (info.tags || []).filter(Boolean);
      if (tags.length) {
        body.append(
          FP.el(
            'ul',
            { class: 'project__tags', 'aria-label': 'Tecnologias' },
            tags.map(function (tag) { return FP.el('li', { text: tag }); }),
          ),
        );
      }

      var buttons = [];
      if (isHttp(info.demo)) buttons.push(linkButton('Ver projeto', info.demo, 'solid'));
      if (isHttp(info.repo)) buttons.push(linkButton('Ver código', info.repo, 'ghost'));
      if (buttons.length) body.append(FP.el('div', { class: 'project__links' }, buttons));
    });

    FP.bindMagnets(document);
  };
})();
