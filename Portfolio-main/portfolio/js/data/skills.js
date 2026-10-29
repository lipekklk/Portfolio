/**
 * Nenhum nível numérico é exibido de propósito.
 * Para cada tecnologia escolha o status:
 *   'conhecimento' | 'aprendizado' | 'utilizada'
 * Hoje todas estão como "Conhecimento"; ajuste conforme a sua realidade.
 */
window.PORTFOLIO_DATA = window.PORTFOLIO_DATA || {};

window.PORTFOLIO_DATA.skillStatusLabels = {
  conhecimento: 'Conhecimento',
  aprendizado: 'Em aprendizado',
  utilizada: 'Tecnologia utilizada',
};

window.PORTFOLIO_DATA.skillCategories = [
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Interfaces e experiência no navegador.',
    icon: 'code',
    skills: [
      { name: 'HTML', abbr: 'HTML', status: 'conhecimento' },
      { name: 'CSS', abbr: 'CSS', status: 'conhecimento' },
      { name: 'JavaScript', abbr: 'JS', status: 'conhecimento' },
      { name: 'TypeScript', abbr: 'TS', status: 'conhecimento' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    description: 'Lógica de negócio e aplicações no servidor.',
    icon: 'server',
    skills: [
      { name: 'C#', abbr: 'C#', status: 'conhecimento' },
      { name: 'Python', abbr: 'Py', status: 'conhecimento' },
      { name: 'PHP', abbr: 'PHP', status: 'utilizada' },
      { name: 'Node.js', abbr: 'Node', status: 'conhecimento' },
    ],
  },
  {
    id: 'database',
    title: 'Banco de Dados',
    description: 'Modelagem, consultas e persistência.',
    icon: 'database',
    skills: [
      { name: 'SQL Server', abbr: 'MS', status: 'conhecimento' },
      { name: 'MySQL', abbr: 'My', status: 'conhecimento' },
      { name: 'SQL', abbr: 'SQL', status: 'conhecimento' },
    ],
  },
  {
    id: 'tools',
    title: 'Ferramentas',
    description: 'Versionamento e colaboração.',
    icon: 'branch',
    skills: [
      { name: 'Git', abbr: 'Git', status: 'conhecimento' },
      { name: 'GitHub', abbr: 'GH', status: 'conhecimento' },
      { name: 'SupaBase', abbr: 'SB', status: 'conhecimento' },    
      { name: 'MongoDB', abbr: 'MDB', status: 'utilizada' },
      { name: 'Visual Studio Code', abbr: 'VS', status: 'conhecimento' },
    ],
  },
  {
    id: 'apis',
    title: 'APIs',
    description: 'Integração entre sistemas.',
    icon: 'plug',
    skills: [{ name: 'REST APIs', abbr: 'API', status: 'conhecimento' }],
  },
  {
    id: 'infra',
    title: 'Infraestrutura',
    description: 'Base técnica para manter sistemas de pé.',
    icon: 'monitor',
    skills: [{ name: 'Infraestrutura e suporte', abbr: 'IT', status: 'conhecimento' }],
  },
];
