// Backend para confirmação de e-mail do formulário de contato
// api/contact-confirmation.js

const nodemailer = require('nodemailer');

// Configuração do transporte de e-mail (ajuste para seu provedor)
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro
  auth: {
    user: 'SEU_EMAIL@gmail.com',
    pass: 'SENHA_DO_EMAIL'
  }
});

// Envia e-mail de confirmação simples
function sendConfirmationEmail(email, nome) {
  return transporter.sendMail({
    from: 'SEU_EMAIL@gmail.com',
    to: email,
    subject: 'Recebemos sua mensagem!',
    html: `<p>Olá${nome ? ' ' + nome : ''},<br><br>Sua mensagem foi recebida com sucesso! Em breve entraremos em contato.<br><br>Obrigado!</p>`
  });
}

// Endpoint para receber contato e enviar confirmação simples
module.exports = async function (req, res) {
  if (req.method === 'POST') {
    const { email, nome, mensagem } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });
    await sendConfirmationEmail(email, nome);
    return res.json({ ok: true });
  }
  res.status(405).end();
};
