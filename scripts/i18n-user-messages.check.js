#!/usr/bin/env node
/**
 * Regression check for user-facing runtime messages.
 *
 * The lead magnet, ebook confirmation, newsletter, and contact flows must read
 * visible text through the shared i18n dictionaries instead of hardcoding one
 * language in browser scripts.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const checkedFiles = [
  'js/components/newsletter-manager.js',
  'js/components/contact-form-enhanced.js',
  'pages/public/lead-magnet.html',
  'pages/public/thanks-ebook.html',
  'dashboard.html',
  'js/payment-links.js',
  'api/contact-confirmation.js',
];

const forbiddenSnippets = [
  'Verifique seu email. O ebook foi enviado para sua caixa de entrada.',
  'SMTP local não está configurado',
  'Sucesso!</h3>',
  'Erro ao processar',
  'Por favor, aceite os termos.',
  'Subscription successful!',
  'Reenviando...',
  'Pronto! Reenviamos',
  'Thanks — your details have been received.',
  'Something went wrong while sending your details.',
  'Por favor, aguarde enquanto verificamos suas credenciais.',
  'Voltar para Login</a>',
  'Plano não encontrado. Tente novamente.',
  'Recebemos sua mensagem!',
  'E-mail obrigatório',
];

const violations = [];

for (const relativePath of checkedFiles) {
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const snippet of forbiddenSnippets) {
    if (source.includes(snippet)) {
      violations.push(`${relativePath}: hardcoded message "${snippet}"`);
    }
  }
}

if (violations.length) {
  throw new Error(`User-facing i18n regressions found:\n${violations.join('\n')}`);
}

console.log('User-facing i18n message check passed.');
