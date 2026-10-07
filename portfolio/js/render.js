/* Renderização das seções a partir dos arquivos de js/data/. */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const D = window.PORTFOLIO_DATA;
  const { esc, icon, $, $$ } = P;

  /* ---------- Links sociais ---------- */
  P.social = [
    {
      id: 'github',
      label: 'GitHub',
      icon: 'github',
      href: D.config.githubUsername ? 'https://github.com/' + encodeURIComponent(D.config.githubUsername) : '',
      display: D.config.githubUsername ? 'github.com/' + D.config.githubUsername : 'GitHub (a configurar)',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'linkedin',
      href: D.config.linkedinUrl,
      display: 'linkedin.com/in/felipe-passos-sandoval-dos-santos-b2172a33b',
    },
    {
      id: 'email',
      label: 'E-mail',
      icon: 'mail',
      href: D.config.email ? 'mailto:' + D.config.email : '',
      display: D.config.email || 'E-mail (a configurar)',
    },
  ];

  const external = (item) => (item.id === 'email' ? '' : ' target="_blank" rel="noopener noreferrer"');

  function renderSocial() {
    $$('[data-social]').forEach((container) => {
      if (container.getAttribute('data-social') === 'contact') {
        container.innerHTML =
          '<ul class="contact__links" aria-label="Canais de contato">' +
          P.social
            .map((item) => {
              const inner =
                '<span class="contact__link-icon">' + icon(item.icon) + '</span>' +
                '<span class="contact__link-text"><strong>' + esc(item.label) + '</strong><span>' +
                esc(item.display) + '</span></span>';
              return item.href
                ? '<li><a class="contact__link" href="' + esc(item.href) + '"' + external(item) + '>' + inner + '</a></li>'
                : '<li><span class="contact__link" role="link" aria-disabled="true">' + inner + '</span></li>';
            })
            .join('') +
          '</ul>';
        return;
      }
      container.innerHTML =
        '<ul class="social" aria-label="Links profissionais">' +
        P.social
          .map((item) =>
            item.href
              ? '<li><a class="social__link" href="' + esc(item.href) + '"' + external(item) +
                ' aria-label="' + esc(item.label) + '" title="' + esc(item.label) + '">' + icon(item.icon) + '</a></li>'
              : '<li><span class="social__link" role="link" aria-disabled="true" aria-label="' + esc(item.label) +
                ' (ainda não configurado)" title="' + esc(item.label) + ': configure em js/data/config.js">' +
                icon(item.icon) + '</span></li>',
          )
          .join('') +
        '</ul>';
    });
  }

  /* ---------- Sobre: foto opcional ---------- */
  function renderAvatar() {
    if (!D.config.photo) return;
    $('#about-avatar').innerHTML =
      '<img src="' + esc(D.config.photo) + '" alt="Foto de Felipe Passos" loading="lazy" decoding="async" />';
  }

  /* ---------- Preview gerado (quando não há imagem) ---------- */
  let previewCount = 0;
  function generatedPreview(label, variant) {
    const id = 'gp' + ++previewCount;
    const body =
      variant === 'certificate'
        ? '<rect class="gp-panel gp-stroke" x="130" y="50" width="380" height="260" rx="14" fill="#12141f" stroke="#fff" stroke-opacity=".16"/>' +
          '<rect x="146" y="66" width="348" height="228" rx="8" fill="none" stroke="url(#' + id + 'g)" stroke-opacity=".55" stroke-dasharray="6 6"/>' +
          '<rect x="240" y="100" width="160" height="12" rx="6" fill="url(#' + id + 'g)"/>' +
          '<rect class="gp-ink" x="200" y="132" width="240" height="8" rx="4" fill="#fff" fill-opacity=".16"/>' +
          '<rect class="gp-ink" x="220" y="152" width="200" height="8" rx="4" fill="#fff" fill-opacity=".1"/>' +
          '<rect class="gp-ink" x="180" y="236" width="110" height="6" rx="3" fill="#fff" fill-opacity=".16"/>' +
          '<circle cx="440" cy="232" r="26" fill="none" stroke="url(#' + id + 'g)" stroke-width="4"/>' +
          '<path d="m428 232 8 8 16-18" fill="none" stroke="#8b7cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<rect class="gp-panel gp-stroke" x="120" y="70" width="400" height="220" rx="16" fill="#12141f" stroke="#fff" stroke-opacity=".14"/>' +
          '<rect class="gp-ink" x="120" y="70" width="400" height="34" rx="16" fill="#fff" fill-opacity=".04"/>' +
          '<circle cx="144" cy="87" r="5" fill="#ff6b7a"/><circle cx="162" cy="87" r="5" fill="#ffc857"/><circle cx="180" cy="87" r="5" fill="#5be3a0"/>' +
          '<rect x="148" y="130" width="120" height="10" rx="5" fill="url(#' + id + 'g)"/>' +
          '<rect class="gp-ink" x="148" y="154" width="210" height="8" rx="4" fill="#fff" fill-opacity=".14"/>' +
          '<rect class="gp-ink" x="148" y="174" width="170" height="8" rx="4" fill="#fff" fill-opacity=".1"/>' +
          '<rect class="gp-ink" x="148" y="194" width="240" height="8" rx="4" fill="#fff" fill-opacity=".1"/>' +
          '<rect x="148" y="232" width="92" height="30" rx="15" fill="url(#' + id + 'g)"/>' +
          '<path d="M440 160 408 190l32 30M480 160l32 30-32 30" fill="none" stroke="url(#' + id + 'g)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>';

    let grid = '';
    for (let i = 0; i < 12; i++) grid += '<line x1="' + i * 56 + '" y1="0" x2="' + i * 56 + '" y2="360"/>';
    for (let i = 0; i < 7; i++) grid += '<line x1="0" y1="' + i * 56 + '" x2="640" y2="' + i * 56 + '"/>';

    return (
      '<svg viewBox="0 0 640 360" role="img" aria-label="Preview ilustrativo: ' + esc(label) + '" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7cff"/><stop offset="1" stop-color="#38d9ff"/></linearGradient>' +
      '<radialGradient id="' + id + 'r" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#8b7cff" stop-opacity=".35"/><stop offset="1" stop-color="#0b0d14" stop-opacity="0"/></radialGradient></defs>' +
      '<rect class="gp-bg" width="640" height="360" fill="#0b0d14"/><rect width="640" height="360" fill="url(#' + id + 'r)"/>' +
      '<g class="gp-grid" stroke="#fff" stroke-opacity=".05">' + grid + '</g><g>' + body + '</g></svg>'
    );
  }

  /* ---------- Skills ---------- */
  function renderSkills() {
    const labels = D.skillStatusLabels;
    const used = Array.from(new Set(D.skillCategories.flatMap((c) => c.skills.map((s) => s.status))));
    $('#skills-legend').innerHTML = used
      .map((status) => '<span><i class="status-dot" data-status="' + esc(status) + '" aria-hidden="true"></i>' + esc(labels[status]) + '</span>')
      .join('');

    $('#skills-grid').innerHTML = D.skillCategories
      .map((cat, index) => {
        const skills = cat.skills
          .map(
            (skill) =>
              '<li class="skill"><span class="skill__badge" data-len="' + skill.abbr.length + '" aria-hidden="true">' + esc(skill.abbr) + '</span>' +
              '<span class="skill__name">' + esc(skill.name) + '</span>' +
              '<span class="skill__status" title="' + esc(labels[skill.status]) + '"><i class="status-dot" data-status="' + esc(skill.status) +
              '" aria-hidden="true"></i><span>' + esc(labels[skill.status]) + '</span></span></li>',
          )
          .join('');
        return (
          '<div class="skill-cat glass spotlight reveal ' + (index < 2 ? 'skill-cat--wide' : '') + '" style="--delay:' + (index % 3) * 90 + 'ms">' +
          '<div class="skill-cat__head"><span class="skill-cat__icon">' + icon(cat.icon) + '</span>' +
          '<div><h3 class="skill-cat__title">' + esc(cat.title) + '</h3><p class="skill-cat__desc">' + esc(cat.description) + '</p></div></div>' +
          '<ul class="skill-list">' + skills + '</ul></div>'
        );
      })
      .join('');
  }

  /* ---------- Projetos (com filtro animado) ---------- */

  /** Caminho da imagem do projeto. Aceita `imagem` (padrão do projeto) ou `image` (alias). */
  const projectImage = (project) => String(project.imagem || project.image || '').trim();

  function projectCard(project, index) {
    const src = projectImage(project);
    // Com imagem: <img> com lazy-load + estado "loading" (shimmer). Sem imagem: preview SVG gerado.
    const media = src
      ? '<img src="' + esc(src) + '" alt="Preview do projeto ' + esc(project.titulo) + '" loading="lazy" decoding="async" width="640" height="360" />'
      : generatedPreview(project.titulo, 'project');
    const flag = project.placeholder ? '<span class="project__flag tag tag--warn">Placeholder — substitua</span>' : '';

    const action = (href, cls, label, ico, missing) =>
      href
        ? '<a class="btn ' + cls + ' btn--sm" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'
        : '<span class="btn ' + cls + ' btn--sm btn--disabled" role="link" aria-disabled="true" title="' + missing + '">' + label + '</span>';

    return (
      '<article class="project glass spotlight" style="--i:' + index + '">' +
      '<div class="project__media" data-state="' + (src ? 'loading' : 'ready') + '">' + media + flag + '</div>' +
      '<div class="project__body">' +
      '<ul class="project__cats" aria-label="Categorias">' +
      project.categorias.map((c) => '<li><span class="tag tag--accent">' + esc(c) + '</span></li>').join('') + '</ul>' +
      '<h3 class="project__title">' + esc(project.titulo) + '</h3>' +
      '<p class="project__desc">' + esc(project.descricao) + '</p>' +
      '<ul class="project__tech" aria-label="Tecnologias utilizadas">' +
      project.tecnologias.map((t) => '<li><span class="tag tag--mono">' + esc(t) + '</span></li>').join('') + '</ul>' +
      '<div class="project__actions">' +
      action(project.linkProjeto, 'btn--primary', 'Ver projeto ' + icon('external', 16), 'external', 'Link do projeto ainda não cadastrado') +
      action(project.linkGithub, 'btn--ghost', icon('github', 16) + ' Código', 'github', 'Repositório ainda não cadastrado') +
      '</div></div></article>'
    );
  }

  function renderProjects() {
    const filtersEl = $('#project-filters');
    const wrap = $('#projects-wrap');
    let selected = 'Todos';
    let timer;

    const countFor = (filter) =>
      filter === 'Todos' ? D.projects.length : D.projects.filter((p) => p.categorias.includes(filter)).length;

    filtersEl.innerHTML = D.projectFilters
      .map(
        (f) =>
          '<button type="button" class="filter" data-filter="' + esc(f) + '" aria-pressed="' + (f === 'Todos') + '">' +
          esc(f) + '<span class="filter__count">' + countFor(f) + '</span></button>',
      )
      .join('');

    /* Imagens dos cards: load/error não borbulham, então escutamos na fase de captura
       uma única vez no container (vale para todos os re-renders do filtro). */
    function markLoaded(img) {
      const box = img.closest('.project__media');
      if (box) box.setAttribute('data-state', 'ready');
    }
    function useFallback(img) {
      const box = img.closest('.project__media');
      if (!box || box.getAttribute('data-state') === 'fallback') return;
      const card = box.closest('.project');
      const title = card ? $('.project__title', card).textContent : 'Projeto';
      console.warn('[portfólio] Imagem do projeto não encontrada:', img.getAttribute('src'));
      img.outerHTML = generatedPreview(title + ' (imagem indisponível)', 'project');
      box.insertAdjacentHTML('beforeend', '<span class="project__media-note tag">' + icon('alert', 14) + ' Imagem indisponível</span>');
      box.setAttribute('data-state', 'fallback');
    }
    wrap.addEventListener('load', (e) => e.target.matches && e.target.matches('.project__media img') && markLoaded(e.target), true);
    wrap.addEventListener('error', (e) => e.target.matches && e.target.matches('.project__media img') && useFallback(e.target), true);

    function draw(filter) {
      const list = filter === 'Todos' ? D.projects : D.projects.filter((p) => p.categorias.includes(filter));
      wrap.innerHTML = list.length
        ? '<div class="projects__grid" id="projects-grid">' + list.map(projectCard).join('') + '</div>'
        : '<div class="empty">' + icon('puzzle', 32) + '<p>Nenhum projeto nesta categoria ainda.</p></div>';
      // Imagens já em cache podem estar prontas de imediato (o erro é tratado pelo listener acima).
      $$('.project__media[data-state="loading"] img', wrap).forEach((img) => {
        if (img.complete && img.naturalWidth) markLoaded(img);
      });
    }

    filtersEl.addEventListener('click', (event) => {
      const button = event.target.closest('.filter');
      if (!button || button.getAttribute('data-filter') === selected) return;
      selected = button.getAttribute('data-filter');
      $$('.filter', filtersEl).forEach((b) => b.setAttribute('aria-pressed', String(b === button)));

      clearTimeout(timer);
      const grid = $('#projects-grid');
      if (P.reducedMotion() || !grid) return draw(selected);
      grid.setAttribute('data-leaving', 'true'); // fade-out
      timer = setTimeout(() => draw(selected), 200); // troca e anima a entrada (stagger via CSS)
    });

    draw(selected);
  }

  /* ---------- Certificados + modal acessível ---------- */
  function certImage(cert) {
    return cert.imagem
      ? '<img src="' + esc(cert.imagem) + '" alt="Certificado: ' + esc(cert.nome) + ', ' + esc(cert.instituicao) + '" loading="lazy" decoding="async" />'
      : generatedPreview(cert.nome + ' (certificado ainda não cadastrado)', 'certificate');
  }

  function openCertificate(cert, opener) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML =
      '<div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="cert-modal-title">' +
      '<div class="modal__head"><div><h3 id="cert-modal-title" class="modal__title">' + esc(cert.nome) + '</h3>' +
      '<p class="modal__sub">' + esc(cert.instituicao) + (cert.data ? ' · ' + esc(cert.data) : '') + '</p></div>' +
      '<button type="button" class="modal__close" aria-label="Fechar certificado">' + icon('close') + '</button></div>' +
      '<div class="modal__body">' + certImage(cert) + '</div>' +
      (cert.link
        ? '<div class="modal__foot"><a class="btn btn--ghost btn--sm" href="' + esc(cert.link) + '" target="_blank" rel="noopener noreferrer">Abrir original ' + icon('external', 16) + '</a></div>'
        : '') +
      '</div>';

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(modal);

    const focusable = () => $$('a[href], button:not([disabled])', modal);
    function close() {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      modal.remove();
      if (opener) opener.focus();
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
    $('.modal__close', modal).addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    focusable()[0].focus();
  }

  function renderCertificates() {
    const wrap = $('#certs-wrap');
    if (!D.certificates.length) {
      wrap.innerHTML = '<div class="empty">' + icon('award', 32) + '<p>Nenhum certificado cadastrado ainda.</p></div>';
      return;
    }
    wrap.innerHTML =
      '<ul class="certs__grid">' +
      D.certificates
        .map(
          (cert, index) =>
            '<li class="cert glass spotlight reveal" style="--delay:' + (index % 3) * 90 + 'ms">' +
            '<div class="cert__media">' + certImage(cert) +
            (cert.placeholder ? '<span class="project__flag tag tag--warn">Placeholder — substitua</span>' : '') + '</div>' +
            '<div class="cert__body"><h3 class="cert__title">' + esc(cert.nome) + '</h3>' +
            '<p class="cert__meta">' + esc(cert.instituicao) + '</p>' +
            '<p class="cert__date">' + icon('calendar', 15) + esc(cert.data || 'Data a definir') + '</p>' +
            '<div class="cert__foot"><span class="tag tag--accent">' + esc(cert.categoria) + '</span>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-cert="' + index + '" aria-label="Visualizar certificado: ' + esc(cert.nome) + '">' +
            icon('eye', 16) + ' Visualizar</button></div></div></li>',
        )
        .join('') +
      '</ul>';

    wrap.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cert]');
      if (button) openCertificate(D.certificates[Number(button.getAttribute('data-cert'))], button);
    });
  }

  /* ---------- Timeline (Formação e Jornada) ---------- */
  function timelineHtml(items, label) {
    let lastActive = 0;
    items.forEach((item, i) => { if (item.status !== 'next') lastActive = i; });
    const fill = items.length > 1 ? (lastActive + 0.5) / items.length : 1;

    return (
      '<ol class="timeline" data-fill="' + fill + '" aria-label="' + esc(label) + '">' +
      '<span class="timeline__track" aria-hidden="true"><span class="timeline__fill"></span></span>' +
      items
        .map((item, i) => {
          const ico = item.icon || (item.status === 'done' ? 'check' : 'target');
          const badge = item.badge
            ? '<span class="tag ' + (item.status === 'current' ? 'tag--accent' : '') + '">' + esc(item.badge) + '</span>'
            : '';
          return (
            '<li class="timeline__item timeline__row reveal" style="--delay:' + i * 110 + 'ms" data-status="' + esc(item.status) +
            '" data-placeholder="' + (item.placeholder ? 'true' : 'false') + '">' +
            '<span class="timeline__node" aria-hidden="true">' + icon(ico, 18) + '</span>' +
            '<div class="timeline__card glass"><div class="timeline__head"><h3 class="timeline__title">' + esc(item.title) + '</h3>' + badge + '</div>' +
            (item.subtitle ? '<p class="timeline__sub">' + esc(item.subtitle) + '</p>' : '') +
            (item.period ? '<p class="timeline__period">' + esc(item.period) + '</p>' : '') +
            (item.description ? '<p class="timeline__desc">' + esc(item.description) + '</p>' : '') +
            '</div></li>'
          );
        })
        .join('') +
      '</ol>'
    );
  }

  function renderTimelines() {
    $('#education-timeline').innerHTML = timelineHtml(D.education, 'Linha do tempo da formação');
    $('#journey-timeline').innerHTML = timelineHtml(D.journey, 'Linha do tempo da minha jornada na tecnologia');
  }

  P.renderAll = function () {
    renderSocial();
    renderAvatar();
    renderSkills();
    renderProjects();
    renderCertificates();
    renderTimelines();
  };
})();
