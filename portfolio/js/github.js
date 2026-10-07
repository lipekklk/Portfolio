/* Seção GitHub: dados reais da API pública (sem token), com cache de 10 min em sessionStorage. */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const { esc, icon, $ } = P;
  const username = window.PORTFOLIO_DATA.config.githubUsername;
  const CACHE_TTL_MS = 10 * 60 * 1000;
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  function readCache() {
    try {
      const entry = JSON.parse(sessionStorage.getItem('gh:' + username));
      return entry && Date.now() - entry.at < CACHE_TTL_MS ? entry : null;
    } catch (e) {
      return null;
    }
  }
  function writeCache(user, repos) {
    try {
      sessionStorage.setItem('gh:' + username, JSON.stringify({ at: Date.now(), user, repos }));
    } catch (e) { /* storage indisponível: segue sem cache */ }
  }

  async function fetchGithub() {
    const base = 'https://api.github.com/users/' + encodeURIComponent(username);
    const headers = { Accept: 'application/vnd.github+json' };
    const [userRes, reposRes] = await Promise.all([
      fetch(base, { headers }),
      fetch(base + '/repos?per_page=100&sort=pushed', { headers }),
    ]);
    if (userRes.status === 404) throw new Error('Usuário do GitHub não encontrado.');
    if (userRes.status === 403 || reposRes.status === 403)
      throw new Error('Limite de requisições da API do GitHub atingido. Tente novamente mais tarde.');
    if (!userRes.ok || !reposRes.ok) throw new Error('Não foi possível carregar os dados do GitHub.');
    return { user: await userRes.json(), repos: await reposRes.json() };
  }

  function languageStats(repos) {
    const counts = new Map();
    repos.filter((r) => !r.fork && r.language).forEach((r) => counts.set(r.language, (counts.get(r.language) || 0) + 1));
    const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count], i) => ({
        name,
        percent: total ? Math.round((count / total) * 100) : 0,
        color: 'hsl(' + (255 - i * 14) + ' 90% ' + (70 - i * 3) + '%)', // do violeta ao ciano
      }));
  }

  function renderReady(user, repos) {
    const byPush = (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at);
    const featured = repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || byPush(a, b))
      .slice(0, 4);
    const recent = repos.slice().sort(byPush).slice(0, 5);
    const langs = languageStats(repos);

    const stats = [
      [user.public_repos, 'repositórios'],
      [user.followers, 'seguidores'],
      [user.following, 'seguindo'],
    ]
      .map(([v, l]) => '<li class="gh__stat"><strong>' + esc(v) + '</strong><span>' + l + '</span></li>')
      .join('');

    const langBlock = langs.length
      ? '<div class="langbar" role="img" aria-label="Distribuição de linguagens nos repositórios">' +
        langs.map((l) => '<span style="width:' + l.percent + '%;background:' + l.color + '"></span>').join('') + '</div>' +
        '<ul class="langlist">' +
        langs.map((l) => '<li><i style="background:' + l.color + '" aria-hidden="true"></i>' + esc(l.name) + ' · ' + l.percent + '%</li>').join('') + '</ul>' +
        '<p class="gh__note">Calculado pelo número de repositórios próprios (sem forks) por linguagem.</p>'
      : '<p class="gh__note">Ainda não há repositórios com linguagem identificada.</p>';

    $('#github-content').innerHTML =
      '<div class="gh__top reveal">' +
      '<div class="gh__profile glass"><div class="gh__user">' +
      '<img class="gh__avatar" src="' + esc(user.avatar_url) + '" alt="Avatar de ' + esc(user.login) + ' no GitHub" width="64" height="64" />' +
      '<div><h3 class="gh__name">' + esc(user.name || user.login) + '</h3><p class="gh__login">@' + esc(user.login) + '</p></div></div>' +
      (user.bio ? '<p class="gh__bio">' + esc(user.bio) + '</p>' : '') +
      '<ul class="gh__stats">' + stats + '</ul></div>' +
      '<div class="gh__langs glass"><h3>Linguagens mais utilizadas</h3>' + langBlock + '</div></div>' +
      (featured.length
        ? '<ul class="gh__repos">' +
          featured
            .map(
              (r, i) =>
                '<li class="repo glass spotlight reveal" style="--delay:' + i * 80 + 'ms">' +
                '<a class="repo__name" href="' + esc(r.html_url) + '" target="_blank" rel="noopener noreferrer">' + icon('github', 16) + ' ' + esc(r.name) + '</a>' +
                '<p class="repo__desc">' + esc(r.description || 'Sem descrição.') + '</p>' +
                '<div class="repo__meta">' + (r.language ? '<span>' + esc(r.language) + '</span>' : '') +
                '<span>' + icon('star', 14) + ' ' + r.stargazers_count + '</span><span>' + icon('fork', 14) + ' ' + r.forks_count + '</span></div></li>',
            )
            .join('') + '</ul>'
        : '') +
      (recent.length
        ? '<div class="gh__recent glass reveal"><h3>Atividade recente</h3><ul class="activity">' +
          recent
            .map(
              (r) =>
                '<li><a href="' + esc(r.html_url) + '" target="_blank" rel="noopener noreferrer">' + esc(r.name) + '</a>' +
                '<time datetime="' + esc(r.pushed_at) + '">último push em ' + dateFormat.format(new Date(r.pushed_at)) + '</time></li>',
            )
            .join('') + '</ul></div>'
        : '');
  }

  P.initGithub = async function () {
    const content = $('#github-content');
    const cta = $('#github-cta');

    cta.innerHTML = username
      ? '<a class="btn btn--primary" href="https://github.com/' + encodeURIComponent(username) + '" target="_blank" rel="noopener noreferrer">' + icon('github', 18) + ' Visitar GitHub</a>'
      : '<span class="btn btn--primary btn--disabled" role="link" aria-disabled="true" title="Configure githubUsername em js/data/config.js">' + icon('github', 18) + ' Visitar GitHub</span>';

    if (!username) {
      content.innerHTML =
        '<div class="gh__state glass reveal">' + icon('github', 36) +
        '<h3>Integração pronta, aguardando o usuário</h3>' +
        '<p>Defina <code>githubUsername</code> em <code>js/data/config.js</code> e esta seção passa a exibir repositórios, linguagens e atividade recente automaticamente.</p>' +
        '<div class="gh__repos" style="width:100%;margin-top:8px" aria-hidden="true"><div class="skeleton" style="height:96px"></div><div class="skeleton" style="height:96px"></div></div></div>';
      return;
    }

    const cached = readCache();
    if (cached) return renderReady(cached.user, cached.repos);

    content.innerHTML =
      '<div role="status" aria-live="polite"><span class="sr-only">Carregando dados do GitHub…</span>' +
      '<div class="gh__top" aria-hidden="true"><div class="skeleton" style="height:240px"></div><div class="skeleton" style="height:240px"></div></div></div>';

    try {
      const { user, repos } = await fetchGithub();
      writeCache(user, repos);
      renderReady(user, repos);
    } catch (error) {
      content.innerHTML =
        '<div class="gh__state glass" role="alert">' + icon('alert', 32) +
        '<h3>Não foi possível carregar o GitHub agora</h3><p>' + esc(error.message || 'Erro inesperado ao consultar o GitHub.') + '</p></div>';
    }
    if (P.observeReveals) P.observeReveals(content);
  };
})();
