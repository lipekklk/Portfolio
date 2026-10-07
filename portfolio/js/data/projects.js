window.PORTFOLIO_DATA = window.PORTFOLIO_DATA || {};

/** Filtros exibidos. Use os mesmos nomes em `categorias` dos projetos. */
window.PORTFOLIO_DATA.projectFilters = ['Todos', 'Frontend', 'Backend', 'Full Stack', 'Acadêmico'];

window.PORTFOLIO_DATA.projects = [
  {
    id: 'quiz-de-biologia',
    titulo: 'Quiz de Biologia',
    descricao:
      'Primeiro desenvolvimento web que realizei, foi para um trabalho escolar no 2° ano do ensino médio. Desde então comecei a realizar projetos pessoais para aprendizado e treino',
    imagem: 'assets/images/projects/quiz-de-biologia.png',
    tecnologias: ['JavaScript', 'CSS', 'HTML'],
    categorias: ['Acadêmico'],
    linkProjeto: 'https://quizdebiologia.netlify.app',
    linkGithub: 'https://github.com/lipekklk/QuizDeBiologia',
    placeholder: false,
  },
  {
    id: 'medicina',
    titulo: 'Medicina Ocupacional',
    descricao:
      'WebSite desenvolvido para treinamento e aprendizado, usei como motivação a empresa que trabalho relacionada a medicina ocupacional',
    imagem: 'assets/images/projects/TreinoMedicina.png',
    tecnologias: ['HTML#', 'CSS', 'JavaScript'],
    categorias: ['Frontend'],
    linkProjeto: 'https://treinomedicina.netlify.app',
    linkGithub: 'https://github.com/lipekklk/TreinoMedicinaOcupacional',
    placeholder: false,
  },
  {
    id: 'ptf',
    titulo: 'Portfólio',
    descricao:
      'Currículo em formato de WebSite, feito para treinamento e demonstração real de trabalho.',
    imagem: 'assets/images/projects/Portfolio.png',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    categorias: ['Frontend'],
    // linkProjeto: 'Curriculofelipepassos.netlify.app',
    linkGithub: '',
    placeholder: false,
  },

  {
    id: 'exemplo-frontend',
    titulo: 'Em desenvolvimento...',
    descricao:
      'Espaço reservado para um projeto em desenvolvimento.',
    imagem: '',
    tecnologias: ['...'],
    categorias: ['...'],
    linkProjeto: '',
    linkGithub: '',
    placeholder: false,
  },
];
