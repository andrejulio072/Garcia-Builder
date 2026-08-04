const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'packages.html'), 'utf8');
const ctaTracking = fs.readFileSync(path.join(root, 'js', 'tracking', 'cta-tracking.js'), 'utf8');
const seoTracking = fs.readFileSync(path.join(root, 'js', 'tracking', 'seo-landing.js'), 'utf8');

const packages = [
  ['monthly', 'Monthly Online Coaching', '233832'],
  ['eight_week', '8-Week Rebuild Programme', '233834'],
  ['twelve_week', '12-Week Transformation Programme', '233835'],
  ['eighteen_week', '18-Week Premium Transformation', '233837']
];

const failures = [];
const requiredLabels = [
  'Best for',
  'Primary objective',
  'Duration',
  'Training structure',
  'Nutrition depth',
  'Check-in method',
  'Plan-update frequency',
  'Support level',
  'Defining difference',
  'Recommended next step'
];

for (const [key, name, checkoutId] of packages) {
  const cardPattern = new RegExp(`data-package-card="${key}"[\\s\\S]*?<\\/article>`);
  const card = html.match(cardPattern)?.[0] || '';
  if (!card) failures.push(`Missing package card: ${key}`);
  for (const label of requiredLabels) {
    if (!card.includes(`<dt>${label}</dt>`)) failures.push(`${name}: missing ${label}`);
  }
  if (!card.includes('href="/assessment?')) failures.push(`${name}: missing primary assessment route`);
  if (!card.includes('>Take Free Assessment</a>')) failures.push(`${name}: assessment is not the primary labelled action`);
  if (!card.includes('href="https://calendly.com/andrenjulio072/consultation"')) failures.push(`${name}: missing Calendly consultation route`);
  if (!card.includes(`packageName:'${name}'`)) failures.push(`${name}: missing package-specific tracking name`);
  if (!card.includes('wa.me/447508497586?text=')) failures.push(`${name}: missing WhatsApp link`);
  if (!card.includes(encodeURIComponent(name).replace(/%20/g, '%20'))) failures.push(`${name}: missing encoded WhatsApp package name`);
  if (!card.includes(`mypthub.net/p/${checkoutId}`)) failures.push(`${name}: checkout URL changed or missing`);
  const assessmentIndex = card.indexOf('Take Free Assessment');
  const consultationIndex = card.indexOf('Book Free Consultation');
  const whatsappIndex = card.indexOf('Ask about this package on WhatsApp');
  const checkoutIndex = card.indexOf('Already decided? Continue to checkout');
  if (!(assessmentIndex < consultationIndex && consultationIndex < whatsappIndex && whatsappIndex < checkoutIndex)) failures.push(`${name}: CTA order is incorrect`);
  if (!card.includes('class="gb-package-checkout-link"')) failures.push(`${name}: checkout must use the de-emphasised link treatment`);
}

if (!ctaTracking.includes("pushDataLayerEvent('whatsapp_click'")) failures.push('Missing whatsapp_click dataLayer event');
if (!ctaTracking.includes("pushDataLayerEvent('book_consultation_click'")) failures.push('Missing book_consultation_click dataLayer event');
if (!ctaTracking.includes('package_name: packageName || undefined')) failures.push('Consultation/WhatsApp tracking missing package_name');
if (!ctaTracking.includes("acc[key] = merged[key] ? String(merged[key]).slice(0, 160) : ''")) failures.push('CTA tracking must include every UTM field');
if (!seoTracking.includes("button_location: packageCard ? 'package_card'")) failures.push('Checkout tracking missing package_card location');
if (!seoTracking.includes("acc[key] = source[key] ? String(source[key]).slice(0, 160) : ''")) failures.push('Checkout tracking must include every UTM field');
if (!html.includes('data-gb-event="begin_checkout"')) failures.push('Missing begin_checkout package buttons');
if ((html.match(/>Take Free Assessment<\/a>/g) || []).length !== packages.length) failures.push('Every package needs one primary assessment CTA');
if ((html.match(/class="gb-package-checkout-link"/g) || []).length !== packages.length) failures.push('Every checkout must be visually de-emphasised');
if (/hooks\.zapier\.com/i.test(html)) failures.push('Zapier webhook exposed in packages.html');
if (/href=["']\/?pricing(?:\.html)?["']/i.test(html)) failures.push('Package CTA points to legacy pricing route');

if (failures.length) throw new Error(`Package CTA contract failed:\n${failures.join('\n')}`);
console.log('Package CTA contract check passed.');
