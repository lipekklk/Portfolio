# Portfólio: Felipe Passos

Site em **HTML, CSS e JavaScript puros**. Sem React, sem TypeScript, sem npm e sem build.
Animações com **GSAP + ScrollTrigger** e rolagem suave com **Lenis** (carregados por CDN).

## Como abrir

- **Mais simples:** dê dois cliques em `index.html`.
- **Com servidor local** (recomendado para testar o formulário e o GitHub):
  `python3 -m http.server 8000` e abra http://localhost:8000
- **Publicar:** arraste a pasta inteira para https://app.netlify.com/drop (ou conecte o repositório; o `netlify.toml` já está pronto).

## Estrutura

```
index.html          todo o conteúdo (textos, projetos, certificados...)
css/
  tokens.css        cores, fontes, temas (cobalto / gelo / índigo)
  base.css          reset, seções empilhadas, títulos
  components.css    cabeçalho, botões, cartões, código, rodapé, formulário
  sections.css      estilos de cada seção
js/
  config.js         SEUS LINKS: WhatsApp, GitHub, LinkedIn, e-mail, links dos projetos, formulário
  lib.js            utilitários (scroll, botões magnéticos, links sociais)
  header.js         menu mobile, esconder ao rolar, seção ativa
  motion.js         todas as animações (GSAP / ScrollTrigger / Lenis)
  github.js         seção GitHub com a API pública
  contact.js        validação e envio do formulário
  viewer.js         visualizador de certificados (imagem) e currículos (PDF)
  projects.js       botões "Ver projeto" / "Ver código" e tecnologias (vêm do config.js)
  main.js           liga tudo
assets/             foto, imagens dos projetos, certificados, currículos (PDF)
favicon.svg  og-image.png  robots.txt  sitemap.xml  netlify.toml
```

## O que editar

| O que | Onde |
|---|---|
| **WhatsApp, GitHub, LinkedIn, e-mail** | `js/config.js` (aparecem em Contato e no rodapé) |
| **Links dos projetos** (site e código) e tecnologias | `js/config.js`, campo `projetos` |
| Textos, formação, experiência, skills | `index.html` (cada seção tem comentários) |
| Novo certificado | copie o bloco `<li class="cert">` em `index.html`, ponha a imagem em `assets/certificados/` |
| Foto, imagens, PDFs | pasta `assets/` (mantenha os nomes ou ajuste no HTML) |
| Cores e fontes | `css/tokens.css` |

## Certificados e currículos

- **Ver certificado** abre a imagem numa janela (Esc ou clique fora fecha), com "Abrir em nova aba" e "Baixar". Sebrae e Semana de TI também têm "Verificar autenticidade" (endereço impresso no próprio certificado); o da Semana de TI tem ainda "Baixar PDF".
- **Currículos:** "Visualizar" abre o PDF numa janela em telas largas com mouse; no celular abre em nova aba (a maioria dos celulares não exibe PDF dentro da página). "Baixar PDF" baixa o arquivo.
- Se o JavaScript não carregar, os links continuam abrindo os arquivos em nova aba.
- O CPF do certificado do Sebrae já vem mascarado pelo próprio Sebrae (575.***.***-25).

## Pendências (em branco de propósito, nada foi inventado)

- `js/config.js`: as `tags` (tecnologias) de cada projeto. WhatsApp, GitHub, LinkedIn e os links de site e repositório dos 4 projetos já estão preenchidos.
- O título "Treino Medicina" foi deduzido do nome do arquivo; confirme.
- Procure por `TODO` no `index.html`: bio, introdução da stack e dos currículos são aproximações.
- "React Native" aparece só no currículo em inglês; remova de `#skills` se não for usar.

## Formulário de contato

- **Padrão:** Netlify Forms. Funciona quando o site está publicado no Netlify (o formulário já tem `data-netlify` e honeypot). Abrindo o site localmente (arquivo, Live Server, localhost) o envio automático não funciona: não existe Netlify Forms por lá.
- **Alternativa:** coloque uma URL (ex.: Formspree) em `formEndpoint` no `js/config.js`; o envio passa a ser JSON para ela.
- Validação no navegador, mensagens de erro por campo, estados "enviando / enviado / erro" e campo armadilha contra robôs.
- Se o envio falhar, o formulário mostra os botões **Enviar por e-mail** e **Enviar pelo WhatsApp** já com a mensagem escrita, então nenhum contato se perde.

### Formulário não envia?

1. **"O envio automático só funciona com o site publicado no Netlify"**: você está testando localmente. Publique e teste no endereço do Netlify.
2. **"O servidor não aceitou a mensagem" no site publicado**: abra o console (F12) e veja o aviso `[contato] envio recusado, HTTP xxx`. 404 ou 405 significa que o Netlify não detectou o formulário.
   - No Netlify: *Forms* deve listar um formulário chamado `contact`. Se não listar, ative a detecção em *Site configuration → Forms* e faça um novo deploy (o upload manual da pasta inteira também serve).
3. **Mensagens chegam só no painel**: em *Forms → Form notifications*, adicione uma notificação por e-mail para receber na caixa de entrada.
4. **Alternativa sem Netlify Forms**: preencha `formEndpoint` em `js/config.js` (ex.: Formspree).

## GitHub

Dados reais da API pública (perfil, contagens, linguagens e 6 repositórios recentes, sem forks). Cache de 10 min no navegador. Se a API falhar ou o limite for atingido, aparece mensagem com botão "Tentar de novo". Nada é inventado.

## Animações e acessibilidade

- Tudo roda dentro de um único `gsap.matchMedia()`: com `prefers-reduced-motion` **nada é criado** (sem Lenis, sem animações, sem divisão de texto) e o GSAP desfaz tudo se a preferência mudar.
- Se a CDN falhar, o site aparece completo, só sem animação.
- Lenis acoplado ao `gsap.ticker` e ao `ScrollTrigger.update`; no celular a rolagem é nativa.
- Pin da "Minha Jornada" só em telas ≥ 900px.
- Foco visível, link "Pular para o conteúdo", menu com Esc e retorno de foco, `aria-label` nos títulos divididos.

## Funcionar offline (opcional)

Baixe `gsap.min.js`, `ScrollTrigger.min.js` (gsap 3.13) e `lenis.min.js` (lenis 1.3) para `js/vendor/` e troque os três `<script src="https://cdn...">` no `index.html`.

## Efeitos inspirados no React Bits

O React Bits é feito para React, então os equivalentes foram escritos em JS puro: nome com peso variável pelo ponteiro (Variable Proximity), botões magnéticos, cartões com brilho (Spotlight Card), títulos em máscara por palavra e parágrafo que acende com a rolagem.
