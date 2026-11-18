/**
 * Configuração do site: é AQUI que você preenche seus links.
 * Campo vazio ('') = o link simplesmente não aparece no site.
 */
window.SITE_CONFIG = {
  /* ---------- Contato (aparecem na seção Contato e no rodapé) ---------- */

  // E-mail exibido no site (veio do currículo; apague se não quiser exibir).
  email: 'felipepassos.acad@gmail.com',

  // WhatsApp: só números, com código do país + DDD + número. Ex.: '5513999999999'.
  whatsapp: '5513996624005', // (13) 99662-4005
  // Mensagem que já vem escrita quando a pessoa abre a conversa (pode apagar).
  whatsappMensagem: 'Olá, Felipe! Vi seu portfólio e gostaria de conversar.',

  // Seu usuário do GitHub (ex.: 'felipepassos'). Quando preenchido, aparece o link
  // no contato/rodapé e a seção "GitHub" surge sozinha, com dados reais da API.
  githubUser: 'lipekklk',

  // URL completa do seu perfil. Ex.: 'https://www.linkedin.com/in/seu-perfil/'
  linkedin: 'https://www.linkedin.com/in/felipe-passos-sandoval-dos-santos-b2172a33b/',

  /* ---------- Projetos ---------- */
  // Para cada projeto: demo (site no ar), repo (código no GitHub) e tags (tecnologias).
  // As chaves são os nomes dos projetos no index.html (data-project="...").
  projetos: {
    'jhen-beauty-care': {
      demo: 'https://jhenbeautycare.netlify.app',
      repo: 'https://github.com/lipekklk/jhen-beauty-care',
      tags: [], // TODO: ex.: ['HTML', 'CSS', 'JavaScript']
    },
    'quiz-de-biologia': {
      demo: 'https://quizdebiologia.netlify.app',
      repo: 'https://github.com/lipekklk/QuizDeBiologia',
      tags: [],
    },
    'treino-medicina': {
      demo: 'https://treinomedicina.netlify.app',
      repo: 'https://github.com/lipekklk/TreinoMedicinaOcupacional',
      tags: [],
    },
    tceg: {
      demo: 'https://www.tceg.com.br/',
      repo: '', // sem repositório informado
      tags: [],
    },
    portfolio: {
      demo: 'https://curriculofelipepassos.netlify.app',
      repo: 'https://github.com/lipekklk/Portfolio',
      tags: [],
    },
  },

  /* ---------- Formulário de contato ---------- */
  // - vazio: usa o Netlify Forms (funciona quando o site está publicado no Netlify);
  // - com uma URL (ex.: Formspree): envia JSON para esse endereço.
  formEndpoint: '',
};
