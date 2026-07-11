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
for (const [key, name, checkoutId] of packages) {
  const cardPattern = new RegExp(`data-package-card="${key}"[\\s\\S]*?<\\/article>`);
  const card = html.match(cardPattern)?.[0] || '';
  if (!card) failures.push(`Missing package card: ${key}`);
  if (!card.includes('href="https://calendly.com/andrenjulio072/consultation"')) failures.push(`${name}: missing Calendly consultation route`);
  if (!card.includes(`packageName:'${name}'`)) failures.push(`${name}: missing package-specific tracking name`);
  if (!card.includes('wa.me/447508497586?text=')) failures.push(`${name}: missing WhatsApp link`);
  if (!card.includes(encodeURIComponent(name).replace(/%20/g, '%20'))) failures.push(`${name}: missing encoded WhatsApp package name`);
  if (!card.includes(`mypthub.net/p/${checkoutId}`)) failures.push(`${name}: checkout URL changed or missing`);
  const consultationIndex = card.indexOf('Book Free Consultation');
  const whatsappIndex = card.indexOf('Chat on WhatsApp');
  const checkoutIndex = card.indexOf('Start checkout');
  if (!(consultationIndex < whatsappIndex && whatsappIndex < checkoutIndex)) failures.push(`${name}: CTA order is incorrect`);
}

if (!ctaTracking.includes("pushDataLayerEvent('whatsapp_click'")) failures.push('Missing whatsapp_click dataLayer event');
if (!ctaTracking.includes("pushDataLayerEvent('book_consultation_click'")) failures.push('Missing book_consultation_click dataLayer event');
if (!ctaTracking.includes('package_name: packageName || undefined')) failures.push('Consultation/WhatsApp tracking missing package_name');
if (!ctaTracking.includes("acc[key] = merged[key] ? String(merged[key]).slice(0, 160) : ''")) failures.push('CTA tracking must include every UTM field');
if (!seoTracking.includes("button_location: packageCard ? 'package_card'")) failures.push('Checkout tracking missing package_card location');
if (!seoTracking.includes("acc[key] = source[key] ? String(source[key]).slice(0, 160) : ''")) failures.push('Checkout tracking must include every UTM field');
if (!html.includes('data-gb-event="begin_checkout"')) failures.push('Missing begin_checkout package buttons');
if (/hooks\.zapier\.com/i.test(html)) failures.push('Zapier webhook exposed in packages.html');
if (/href=["']\/?pricing(?:\.html)?["']/i.test(html)) failures.push('Package CTA points to legacy pricing route');

if (failures.length) throw new Error(`Package CTA contract failed:\n${failures.join('\n')}`);
console.log('Package CTA contract check passed.');
