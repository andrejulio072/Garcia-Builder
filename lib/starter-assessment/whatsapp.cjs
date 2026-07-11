function normalizeWhatsappNumber(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^\+/, '');
}

function getWhatsappNumber() {
  return normalizeWhatsappNumber(process.env.WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '');
}

function buildWhatsappMessage(answers) {
  return [
    'Hi Andre, I completed the Garcia Builder Fitness starter assessment.',
    '',
    `My main goal is: ${answers.primary_goal}`,
    `I can realistically train: ${answers.training_days}`,
    `My biggest challenge is: ${answers.main_barrier}`,
    `I am looking for: ${answers.support_preference}`,
    '',
    'I would like to discuss a structured plan.'
  ].join('\n');
}

function buildWhatsappUrl(answers, number = getWhatsappNumber()) {
  const safeNumber = normalizeWhatsappNumber(number);
  if (!safeNumber) return null;
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(buildWhatsappMessage(answers))}`;
}

module.exports = {
  buildWhatsappMessage,
  buildWhatsappUrl,
  getWhatsappNumber,
  normalizeWhatsappNumber
};
