/* Formulário de contato: validação, honeypot e envio (endpoint opcional ou mailto). */
(function () {
  const P = (window.Portfolio = window.Portfolio || {});
  const { icon, $, $$ } = P;
  const config = window.PORTFOLIO_DATA.config;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    nome: [(v) => v.trim().length >= 2, 'Informe seu nome.'],
    email: [(v) => EMAIL_PATTERN.test(v.trim()), 'Informe um e-mail válido.'],
    assunto: [(v) => v.trim().length >= 3, 'Informe o assunto.'],
    mensagem: [(v) => v.trim().length >= 10, 'Escreva uma mensagem com pelo menos 10 caracteres.'],
  };

  P.initContact = function () {
    const form = $('#contact-form');
    const status = $('#contact-status');
    const submit = $('#contact-submit');
    const submitLabel = $('[data-label]', submit);

    function setStatus(type, message) {
      status.setAttribute('data-type', type);
      const ico = type === 'success' ? icon('check', 18) : type === 'error' ? icon('alert', 18) : '';
      status.innerHTML = ico + (message || '');
    }

    function setFieldError(name, message) {
      const field = $('[data-field="' + name + '"]', form);
      const control = $('[name="' + name + '"]', field);
      const errorId = 'contato-' + name + '-erro';
      const old = $('.field__error', field);
      if (old) old.remove();
      if (!message) {
        field.setAttribute('data-invalid', 'false');
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
        return;
      }
      field.setAttribute('data-invalid', 'true');
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', errorId);
      field.insertAdjacentHTML('beforeend', '<p id="' + errorId + '" class="field__error"></p>');
      $('.field__error', field).textContent = message;
    }

    // Limpa o erro de um campo assim que a pessoa volta a digitar.
    form.addEventListener('input', (event) => {
      const name = event.target.name;
      if (rules[name]) setFieldError(name, '');
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (data.get('website')) return; // honeypot: só robôs preenchem

      const values = {};
      let invalid = 0;
      Object.keys(rules).forEach((name) => {
        values[name] = String(data.get(name) || '');
        const ok = rules[name][0](values[name]);
        setFieldError(name, ok ? '' : rules[name][1]);
        if (!ok) invalid++;
      });
      if (invalid) return setStatus('error', 'Revise os campos destacados.');

      // Sem endpoint: abre o app de e-mail com a mensagem pronta.
      if (!config.contactFormEndpoint) {
        if (!config.email)
          return setStatus('error', 'Formulário ainda não configurado. Defina email ou contactFormEndpoint em js/data/config.js.');
        const body = values.mensagem + '\n\n— ' + values.nome + ' (' + values.email + ')';
        window.location.href =
          'mailto:' + config.email + '?subject=' + encodeURIComponent(values.assunto) + '&body=' + encodeURIComponent(body);
        return setStatus('success', 'Abrindo seu aplicativo de e-mail com a mensagem pronta.');
      }

      submit.disabled = true;
      submitLabel.textContent = 'Enviando…';
      setStatus('sending', '');
      try {
        const response = await fetch(config.contactFormEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error('Falha no envio');
        form.reset();
        setStatus('success', 'Mensagem enviada! Responderei assim que possível.');
      } catch (e) {
        setStatus('error', 'Não foi possível enviar agora. Tente novamente ou use um dos links ao lado.');
      } finally {
        submit.disabled = false;
        submitLabel.textContent = 'Enviar mensagem';
      }
    });
  };
})();
