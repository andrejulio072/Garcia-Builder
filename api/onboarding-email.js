const nodemailer = require('nodemailer');

// Configure from environment variables for security
// Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn('SMTP not fully configured, onboarding emails will be skipped');
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

function renderEmailHtml({ name, planName, trainerizeLink, locale = 'en' }) {
  const titles = {
    en: 'Welcome to Garcia Builder — Your Next Steps',
    pt: 'Bem-vindo ao Garcia Builder — Próximos Passos'
  };
  const nextSteps = {
    en: [
      'Download the Trainerize app and create your account using this invite link.',
      'Fill your profile and availability inside the app.',
      'Expect your personalized plan within 24–48h or reply to this email for any questions.'
    ],
    pt: [
      'Baixe o aplicativo Trainerize e crie sua conta usando este link de convite.',
      'Preencha seu perfil e disponibilidade no app.',
      'Seu plano personalizado chega em 24–48h. Responda este email em caso de dúvidas.'
    ]
  };
  const steps = nextSteps[locale] || nextSteps.en;
  const header = titles[locale] || titles.en;

  return `
  <div style="font-family:Inter,Arial,sans-serif;color:#0b1220">
    <h2>${header}</h2>
    <p>Hi${name ? ' ' + name : ''},</p>
    <p>Plan: <strong>${planName || 'Coaching Plan'}</strong></p>
    <p>
      <a href="${trainerizeLink}" style="display:inline-block;background:#f6c84e;color:#0b1220;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:700">
        Open Trainerize Invite
      </a>
    </p>
    <ol>
      ${steps.map(s => `<li>${s}</li>`).join('')}
    </ol>
    <p>— Garcia Builder</p>
  </div>`;
}

async function sendOnboardingEmail({ to, name, planName, trainerizeLink, locale }) {
  const transport = createTransport();
  if (!transport) {
    return { skipped: true };
  }
  const from = process.env.FROM_EMAIL || 'no-reply@garciabuilder.fitness';
  const subject = locale === 'pt' ? 'Bem-vindo ao Garcia Builder' : 'Welcome to Garcia Builder';
  const html = renderEmailHtml({ name, planName, trainerizeLink, locale });
  await transport.sendMail({ from, to, subject, html });
  return { ok: true };
}

module.exports = { sendOnboardingEmail };
