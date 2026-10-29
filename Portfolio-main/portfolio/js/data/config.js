window.PORTFOLIO_DATA = window.PORTFOLIO_DATA || {};

window.PORTFOLIO_DATA.config = {

  githubUsername: 'lipekklk',

  email: 'felipepassos.acad@gmail.com',

  contactFormEndpoint: '',

  linkedinUrl: 'https://www.linkedin.com/in/felipe-passos-sandoval-dos-santos-b2172a33b',

  /**
   * WHATSAPP — número exibido no site (formato livre, ex.: '(13) 99662-4005').
   * O link https://wa.me/... é gerado automaticamente: remove espaços, parênteses e traços
   * e acrescenta o código do país abaixo (resultado atual: https://wa.me/5513996624005).
   */
  phone: '13 99662-4005',

  /** Código do país usado no link do WhatsApp (Brasil = 55). */
  whatsappCountryCode: '55',

  /** Mensagem que já aparece digitada ao abrir a conversa. Deixe '' para abrir sem mensagem. */
  whatsappMessage: 'Olá, Felipe! Vi seu portfólio e gostaria de conversar.',

  // Os currículos agora ficam em js/data/resumes.js (vários PDFs).
};
