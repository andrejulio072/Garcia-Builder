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
  '28-day-fat-loss-kickstart.html',
  'pages/public/thanks-ebook.html',
  'dashboard.html',
  'js/payment-links.js',
  'api/contact-confirmation.js',
  'js/core/currency-converter.js',
  'js/body-metrics.js',
  'js/components/contact-form.js',
  'pages/public/become-trainer.html',
  'pages/public/my-profile.html',
  'pages/public/profile-manager.html',
  'js/admin/enhanced-dashboard.js',
  'js/admin/trainer-dashboard.js',
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
  "showNotification('Body metrics saved successfully!",
  "showNotification('Saved locally. Will sync when online.",
  "showNotification('Progress photo uploaded!",
  "showNotification('Failed to upload photo",
  "throw new Error('Please complete all required fields before submitting.",
  "showNotification(error.message || 'Failed to submit application. Please try again.",
  "showNotification('Avatar updated successfully!",
  "showNotification('Avatar preview loaded (not saved to server)",
  "showNotification('Failed to upload avatar",
  "alert('File size must be less than 5MB",
  "showToast('Profile saved successfully!",
  "showToast('Failed to save profile",
  "showToast('Please drop an image file",
  "showNotification('Failed to update currency. Please try again.",
  "this.showNotification('Personal information updated successfully!",
  "this.showNotification('Failed to update personal information:",
  "this.showNotification('Fitness profile updated successfully!",
  "this.showNotification('Failed to update fitness profile:",
  "showNotification('Please select a client first",
  "showNotification(`Session marked as",
  "showNotification('Failed to update session status",
  "showNotification('Session created successfully",
  "showNotification('Failed to create session:",
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

