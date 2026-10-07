# Portfólio — Felipe Passos

Site de página única em **HTML, CSS e JavaScript puros**. Sem npm, sem build, sem framework:
é só abrir o `index.html` no navegador (ou publicar a pasta inteira no GitHub Pages, Netlify, Vercel…).

## O que editar

| Quero mudar…                         | Arquivo                      |
| ------------------------------------ | ---------------------------- |
| GitHub, e-mail, foto, formulário     | `js/data/config.js`          |
| Textos do hero e do "Sobre mim"      | `index.html`                 |
| Projetos                             | `js/data/projects.js`        |
| Certificados                         | `js/data/certificates.js`    |
| Tecnologias e status                 | `js/data/skills.js`          |
| Formação / cursos / experiência      | `js/data/education.js`       |
| Minha Jornada                        | `js/data/journey.js`         |
| Cores e fontes                       | `:root` em `css/global.css`  |
| Cores do tema claro                  | `:root[data-theme='light']` em `css/global.css` |

### Pendências (hoje aparecem como "a configurar"; nada foi inventado)

1. `githubUsername` — ativa a seção GitHub com dados reais da API pública e o botão "Visitar GitHub".
2. `email` — ativa o botão de e-mail e o envio via `mailto`.
3. `contactFormEndpoint` — (opcional) endpoint do Formspree/Getform para enviar sem abrir o app de e-mail.
4. Projetos e certificados reais: troque os itens com `placeholder: true`. Imagens de projetos em `assets/images/projects/` e de certificados em `assets/certificados/`.
5. Instituição de ensino em `js/data/education.js`.
6. Depois de publicar: ajuste `og:image` (URL absoluta) e adicione `og:url` no `<head>` do `index.html`.

### Adicionar um projeto

Em `js/data/projects.js`, dentro do array `projects`:

```js
{
  id: 'meu-projeto',
  titulo: 'Nome',
  descricao: 'O que faz e o que você aprendeu.',
  imagem: 'assets/images/projects/meu-projeto.png', // opcional · 16:9 · sem imagem = preview gerado
  tecnologias: ['TypeScript', 'Node.js'],
  categorias: ['Full Stack'],                  // Frontend | Backend | Full Stack | Acadêmico
  linkProjeto: 'https://…',
  linkGithub: 'https://github.com/…',
},
```

### Tema claro / escuro

Botão ☀️/🌙 na navbar. A escolha fica salva no `localStorage` (`portfolio-theme`); sem escolha manual,
o site segue `prefers-color-scheme` do sistema. Todas as cores são variáveis CSS: o tema claro só
redefine os tokens em `:root[data-theme='light']`. Lógica em `js/theme.js` + script inline no `<head>`
(evita o flash de tema errado ao carregar).

## Estrutura

```
index.html
css/   global.css (tokens, reset, botões) · layout.css (navbar, hero, footer) · sections.css (seções)
js/
  data/   config, skills, projects, certificates, education, journey   ← conteúdo editável
  utils.js · icons.js · theme.js · render.js · github.js · contact.js · ui.js · particles.js · main.js
assets/   favicon.svg, og-image.png, foto
  images/projects/   imagens dos cards de projeto
```

## Acessibilidade e performance

HTML semântico, skip link, foco visível, `aria-*` em menu/filtros/modal, navegação por teclado,
`prefers-reduced-motion` respeitado (sem loader, reveal, partículas ou parallax).
Um único listener de scroll via `requestAnimationFrame`, canvas pausado fora da tela,
imagens com `loading="lazy"`.
