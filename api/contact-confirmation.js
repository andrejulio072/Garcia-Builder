// Contact form confirmation email endpoint.
// api/contact-confirmation.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'SEU_EMAIL@gmail.com',
    pass: 'SENHA_DO_EMAIL'
  }
});

const MESSAGES = {
  en: {
    subject: 'We received your message',
    greeting: 'Hi',
    body: 'Your message was received successfully. We will contact you soon.',
    thanks: 'Thank you!'
  },
  pt: {
    subject: 'Recebemos sua mensagem',
    greeting: 'Ola',
    body: 'Sua mensagem foi recebida com sucesso. Em breve entraremos em contato.',
    thanks: 'Obrigado!'
  },
  es: {
    subject: 'Recibimos tu mensaje',
    greeting: 'Hola',
    body: 'Tu mensaje fue recibido correctamente. Nos pondremos en contacto pronto.',
    thanks: 'Gracias!'
  }
};

function resolveLanguage(value) {
  const lang = String(value || 'en').toLowerCase();
  if (lang.startsWith('pt')) return 'pt';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function sendConfirmationEmail(email, nome, language) {
  const copy = MESSAGES[resolveLanguage(language)] || MESSAGES.en;
  const safeName = nome ? ` ${escapeHtml(String(nome).trim())}` : '';
  return transporter.sendMail({
    from: 'SEU_EMAIL@gmail.com',
    to: email,
    subject: copy.subject,
    html: `<p>${copy.greeting}${safeName},<br><br>${copy.body}<br><br>${copy.thanks}</p>`
  });
}

module.exports = async function (req, res) {
  if (req.method === 'POST') {
    const { email, nome, language, lang, locale } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    await sendConfirmationEmail(email, nome, language || lang || locale);
    return res.json({ ok: true });
  }
  res.status(405).end();
};
