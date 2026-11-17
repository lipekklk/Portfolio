/*
 * Seção GitHub com dados reais da API pública (https://api.github.com).
 * Nada é inventado: se a API falhar, aparece uma mensagem com "Tentar de novo".
 * Só aparece quando `githubUser` está preenchido em js/config.js.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  var API = 'https://api.github.com';
  var CACHE_TTL_MS = 10 * 60 * 1000;
  var number = new Intl.NumberFormat('pt-BR');

  function GithubError(message, status) {
    this.name = 'GithubError';
    this.message = message;
    this.status = status;
  }
  GithubError.prototype = Object.create(Error.prototype);

  function getJson(path) {
    var key = 'gh:' + path;
    try {
      var raw = sessionStorage.getItem(key);
      if (raw) {
        var cached = JSON.parse(raw);
        if (Date.now() - cached.t < CACHE_TTL_MS) return Promise.resolve(cached.d);
      }
    } catch (error) {
      /* cache indisponível: segue sem ele */
    }

    return fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } }).then(
      function (response) {
        if (response.status === 404) throw new GithubError('Usuário do GitHub não encontrado.', 404);
        if (response.status === 403 || response.status === 429) {
          throw new GithubError(
            'O limite de consultas da API do GitHub foi atingido. Tente novamente em alguns minutos.',
            response.status,
          );
        }
        if (!response.ok) {
          throw new GithubError('Não foi possível carregar os dados do GitHub agora.', response.status);
        }
        return response.json().then(function (data) {
          try {
            sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
          } catch (error) {
            /* ignora */
          }
          return data;
        });
      },
      function () {
        throw new GithubError('Sem conexão com o GitHub. Verifique sua internet e tente de novo.');
      },
    );
  }

  function fetchSummary(username) {
    var name = encodeURIComponent(username);
    return Promise.all([
      getJson('/users/' + name),
      getJson('/users/' + name + '/repos?per_page=100&sort=pushed'),
    ]).then(function (results) {
      var user = results[0];
      var all = results[1];

      // Só repositórios próprios (sem forks), do mais recente para o mais antigo.
      var repos = all
        .filter(function (repo) { return !repo.fork; })
        .sort(function (a, b) { return Date.parse(b.pushed_at) - Date.parse(a.pushed_at); });

      var counts = {};
      repos.forEach(function (repo) {
        if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
      });
      var withLanguage = Object.keys(counts).reduce(function (sum, key) { return sum + counts[key]; }, 0);
      var languages = Object.keys(counts)
        .map(function (key) {
          return {
            name: key,
            count: counts[key],
            percent: withLanguage ? Math.round((counts[key] / withLanguage) * 100) : 0,
          };
        })
        .sort(function (a, b) { return b.count - a.count; })
        .slice(0, 5);

      // Só soma as estrelas se todos os repositórios foram carregados (a API traz até 100).
      var complete = user.public_repos <= all.length;
      var totalStars = complete
        ? repos.reduce(function (sum, repo) { return sum + repo.stargazers_count; }, 0)
        : null;

      return { user: user, repos: repos, totalStars: totalStars, languages: languages };
    });
  }

  /* ---------------- Renderização (sempre com textContent) ---------------- */

  function button(label, attrs) {
    var link = FP.el(
      attrs.href ? 'a' : 'button',
      Object.assign({ class: 'btn btn--ghost btn--sm', text: label }, attrs),
    );
    return FP.el('span', { class: 'btn-magnet' }, [link]);
  }

  function stat(value, label) {
    return FP.el('div', null, [FP.el('dd', { text: number.format(value) }), FP.el('dt', { text: label })]);
  }

  function renderSuccess(box, data) {
    var user = data.user;
    var displayName = user.name || user.login;

    var profile = FP.el('div', { class: 'gh__profile' }, [
      FP.el('img', {
        class: 'gh__avatar',
        src: user.avatar_url,
        alt: 'Avatar de ' + displayName + ' no GitHub',
        width: 96,
        height: 96,
        loading: 'lazy',
        decoding: 'async',
      }),
      FP.el('div', null, [
        FP.el('p', { class: 'gh__name', text: displayName }),
        FP.el('p', { class: 'gh__login', text: '@' + user.login }),
        user.bio ? FP.el('p', { class: 'gh__bio', text: user.bio }) : null,
      ]),
      button('Abrir perfil', { href: user.html_url, target: '_blank', rel: 'noopener noreferrer' }),
    ]);

    var stats = FP.el('dl', { class: 'gh__stats' }, [
      stat(user.public_repos, 'Repositórios públicos'),
      stat(user.followers, 'Seguidores'),
      stat(user.following, 'Seguindo'),
      data.totalStars !== null ? stat(data.totalStars, 'Estrelas recebidas') : null,
    ]);

    var wrapper = FP.el('div', { class: 'gh' }, [profile, stats]);

    if (data.languages.length > 0) {
      var list = FP.el(
        'ul',
        { class: 'gh__lang-list' },
        data.languages.map(function (lang) {
          var fill = FP.el('span');
          fill.style.width = Math.max(lang.percent, 4) + '%';
          return FP.el('li', null, [
            FP.el('span', { text: lang.name }),
            FP.el('span', { class: 'gh__lang-bar', 'aria-hidden': 'true' }, [fill]),
            FP.el('span', { text: lang.percent + '%' }),
          ]);
        }),
      );
      wrapper.append(
        FP.el('div', { class: 'gh__langs' }, [
          FP.el('h3', { class: 'gh__h3', text: 'Linguagens mais usadas nos repositórios' }),
          list,
        ]),
      );
    }

    if (data.repos.length > 0) {
      var repos = FP.el(
        'ul',
        { class: 'gh__repos' },
        data.repos.slice(0, 6).map(function (repo) {
          var link = FP.el(
            'a',
            { class: 'gh__repo-link', href: repo.html_url, target: '_blank', rel: 'noopener noreferrer' },
            [
              FP.el('span', { class: 'gh__repo-name', text: repo.name }),
              FP.el('span', { class: 'gh__repo-desc', text: repo.description || 'Sem descrição.' }),
              FP.el('span', { class: 'gh__repo-meta' }, [
                repo.language ? FP.el('span', { text: repo.language }) : null,
                FP.el('span', { text: number.format(repo.stargazers_count) + ' estrelas' }),
              ]),
            ],
          );
          return FP.el('li', null, [FP.el('div', { class: 'spot gh__repo' }, [link])]);
        }),
      );
      wrapper.append(
        FP.el('div', null, [FP.el('h3', { class: 'gh__h3', text: 'Repositórios recentes' }), repos]),
      );
    } else {
      wrapper.append(FP.el('p', { class: 'gh__status', text: 'Nenhum repositório público próprio encontrado ainda.' }));
    }

    box.replaceChildren(wrapper);
    FP.bindMagnets(box);
  }

  function load(box, username) {
    box.replaceChildren(
      FP.el('p', { class: 'gh__status', role: 'status', text: 'Carregando dados do GitHub…' }),
    );

    fetchSummary(username)
      .then(function (data) { renderSuccess(box, data); })
      .catch(function (error) {
        var retry = button('Tentar de novo', { type: 'button' });
        retry.querySelector('button').addEventListener('click', function () { load(box, username); });
        box.replaceChildren(
          FP.el('div', { class: 'gh__status gh__status--error', role: 'alert' }, [
            FP.el('p', {
              text: error && error.message ? error.message : 'Não foi possível carregar os dados do GitHub.',
            }),
            retry,
          ]),
        );
        FP.bindMagnets(box);
      })
      .then(function () { FP.refreshScroll(); });
  }

  FP.initGithub = function () {
    var username = (FP.config.githubUser || '').trim();
    var section = document.getElementById('github');
    var box = document.getElementById('github-conteudo');
    if (!section || !box || !username) return; // sem usuário: a seção continua oculta

    section.hidden = false;
    load(box, username);
  };
})();
