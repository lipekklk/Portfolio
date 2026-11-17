/*
 * Formulário de contato: validação, estados (enviando / sucesso / erro) e envio.
 *  - Sem `formEndpoint` em js/config.js: envia para o Netlify Forms (site publicado no Netlify).
 *  - Com `formEndpoint` (ex.: Formspree): envia JSON para esse endereço.
 */
(function () {
  'use strict';

  var FP = (window.FP = window.FP || {});

  var MESSAGE_MAX = 2000;
  var TIMEOUT_MS = 12000;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var FIELDS = ['nome', 'email', 'assunto', 'mensagem'];

  function validate(values) {
    var errors = {};
    if (values.nome.trim().length < 2) errors.nome = 'Informe seu nome (mínimo de 2 caracteres).';
    if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Informe um e-mail válido, como nome@dominio.com.';
    if (values.assunto.trim().length < 3) errors.assunto = 'Informe o assunto (mínimo de 3 caracteres).';
    if (values.mensagem.trim().length < 10) errors.mensagem = 'Escreva sua mensagem (mínimo de 10 caracteres).';
    else if (values.mensagem.length > MESSAGE_MAX) {
      errors.mensagem = 'A mensagem pode ter no máximo ' + MESSAGE_MAX + ' caracteres.';
    }
    return errors;
  }

  function ContactError(message, status) {
    this.name = 'ContactError';
    this.message = message;
    this.status = status;
  }
  ContactError.prototype = Object.create(Error.prototype);

  /** Envia a mensagem. `honeypot` preenchido indica robô: simula sucesso e não envia nada. */
  function send(values, honeypot) {
    if (honeypot) return Promise.resolve();

    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
    var request;

    if (FP.config.formEndpoint) {
      request = fetch(FP.config.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
    } else {
      var body = new URLSearchParams({
        'form-name': 'contact',
        nome: values.nome.trim(),
        email: values.email.trim(),
        assunto: values.assunto.trim(),
        mensagem: values.mensagem.trim(),
        'bot-field': '',
      });
      request = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      });
    }

    return request
      .then(function (response) {
        if (!response.ok) {
          // Para quem mantém o site: o código ajuda a achar a causa (404/405 = formulário não detectado pelo Netlify).
          console.warn('[contato] envio recusado, HTTP ' + response.status + ' em ' + location.href);
          throw new ContactError('O servidor não aceitou a mensagem.', response.status);
        }
      })
      .catch(function (error) {
        if (error instanceof ContactError) throw error;
        if (controller.signal.aborted) {
          throw new ContactError('O envio demorou demais. Verifique sua conexão e tente novamente.');
        }
        throw new ContactError('Sem conexão para enviar a mensagem. Verifique sua internet e tente novamente.');
      })
      .then(
        function () { window.clearTimeout(timer); },
        function (error) { window.clearTimeout(timer); throw error; },
      );
  }

  FP.initContact = function () {
    var form = document.getElementById('form-contato');
    if (!form) return;

    var done = document.getElementById('cf-sucesso');
    var submit = document.getElementById('cf-enviar');
    var feedback = document.getElementById('cf-feedback');
    var counter = document.getElementById('cf-contador');
    var bot = document.getElementById('cf-bot');
    var inputs = {};
    FIELDS.forEach(function (name) { inputs[name] = form.elements[name]; });

    var touched = {};
    var sending = false;

    function values() {
      var result = {};
      FIELDS.forEach(function (name) { result[name] = inputs[name].value; });
      return result;
    }

    function renderErrors() {
      var errors = validate(values());
      FIELDS.forEach(function (name) {
        var message = touched[name] ? errors[name] : '';
        var box = document.getElementById('cf-' + name + '-erro');
        box.textContent = message || '';
        box.hidden = !message;
        if (message) inputs[name].setAttribute('aria-invalid', 'true');
        else inputs[name].removeAttribute('aria-invalid');
      });
    }

    function setSending(value) {
      sending = value;
      FIELDS.forEach(function (name) { inputs[name].disabled = value; });
      submit.disabled = value;
      submit.textContent = value ? 'Enviando…' : 'Enviar mensagem';
    }

    /** Texto da mensagem para os canais alternativos (e-mail / WhatsApp). */
    function plainMessage() {
      var v = values();
      return (
        v.assunto.trim() + '\n\n' + v.mensagem.trim() + '\n\n— ' + v.nome.trim() + ' (' + v.email.trim() + ')'
      );
    }

    function fallbackButton(label, href, external) {
      var link = FP.el('a', {
        class: 'btn btn--ghost btn--sm',
        href: href,
        target: external ? '_blank' : null,
        rel: external ? 'noopener noreferrer' : null,
        text: label,
      });
      return FP.el('span', { class: 'btn-magnet' }, [link]);
    }

    /** Mostra o erro e oferece e-mail / WhatsApp com a mensagem pronta, para nada se perder. */
    function showError(error) {
      var message = error && error.message ? error.message : 'Não foi possível enviar a mensagem.';
      if (FP.isLocalPreview() && error && error.status) {
        message = 'O envio automático só funciona com o site publicado no Netlify.';
      }

      var buttons = [];
      var text = plainMessage();
      var subject = values().assunto.trim();
      if (FP.config.email) {
        buttons.push(
          fallbackButton(
            'Enviar por e-mail',
            'mailto:' + FP.config.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text),
            false,
          ),
        );
      }
      var whatsapp = FP.whatsappUrl(text);
      if (whatsapp) buttons.push(fallbackButton('Enviar pelo WhatsApp', whatsapp, true));

      var children = [FP.el('p', { class: 'cf__error cf__error--block', text: message + (buttons.length ? ' Envie por um destes canais:' : '') })];
      if (buttons.length) children.push(FP.el('div', { class: 'cf__fallback-actions' }, buttons));
      feedback.replaceChildren(FP.el('div', { class: 'cf__fallback' }, children));
      FP.bindMagnets(feedback);
    }

    FIELDS.forEach(function (name) {
      inputs[name].addEventListener('input', function () {
        feedback.replaceChildren();
        if (name === 'mensagem') counter.textContent = inputs.mensagem.value.length + ' / ' + MESSAGE_MAX;
        renderErrors();
      });
      inputs[name].addEventListener('blur', function () {
        touched[name] = true;
        renderErrors();
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sending) return;

      var found = validate(values());
      var firstInvalid = FIELDS.filter(function (name) { return found[name]; })[0];
      if (firstInvalid) {
        FIELDS.forEach(function (name) { touched[name] = true; });
        renderErrors();
        inputs[firstInvalid].focus();
        return;
      }

      setSending(true);
      feedback.replaceChildren();

      send(values(), bot.value)
        .then(function () {
          form.reset();
          touched = {};
          counter.textContent = '0 / ' + MESSAGE_MAX;
          renderErrors();
          setSending(false);
          form.hidden = true;
          done.hidden = false;
        })
        .catch(function (error) {
          setSending(false);
          showError(error);
        });
    });

    document.getElementById('cf-outra').addEventListener('click', function () {
      done.hidden = true;
      form.hidden = false;
      inputs.nome.focus();
    });
  };
})();
