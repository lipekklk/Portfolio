/**
 * "Minha Jornada". Mantenha apenas o que realmente aconteceu como 'done'.
 * Etapas futuras usam status 'next' e aparecem como "Próximo objetivo".
 * Para registrar um novo marco, adicione um item (e ajuste o status do anterior).
 *
 * O item marcado como `placeholder` espera que você complete com data e história reais.
 */
window.PORTFOLIO_DATA = window.PORTFOLIO_DATA || {};

window.PORTFOLIO_DATA.journey = [
  {
    id: 'inicio',
    title: 'Início dos estudos em tecnologia',
    description: 'Entrada no curso Tecnologia em Análise e Desenvolvimento de Sistemas. (Janeiro de 2025)',
    status: 'done',
    icon: 'terminal', 
    placeholder: true,
  },
  {
    id: 'ads',
    title: 'Graduação em Análise e Desenvolvimento de Sistemas',
    description: 'Estudo estruturado de programação, banco de dados e desenvolvimento de sistemas.',
    status: 'current',
    badge: 'Em andamento',
    icon: 'graduation',
  },
  {
    id: 'projetos',
    title: 'Projetos acadêmicos e pessoais',
    description: 'Construindo projetos para colocar o aprendizado em prática.',
    status: 'current',
    badge: 'Em desenvolvimento',
    icon: 'code',
  },
  {
    id: 'oportunidade',
    title: 'Primeira oportunidade profissional',
    description: 'Estágio ou vaga júnior para aprender em time e em produção.',
    status: 'next',
    badge: 'Próximo objetivo',
    icon: 'flag',
  },
  {
    id: 'evolucao',
    title: 'Evolução como desenvolvedor',
    description: 'Aprofundar as tecnologias, entregar projetos maiores e crescer na carreira.',
    status: 'next',
    badge: 'Em seguida',
    icon: 'rocket',
  },
];
