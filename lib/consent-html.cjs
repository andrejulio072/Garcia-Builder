'use strict';

const BOOTSTRAP_SRC = '/js/tracking/site-consent-bootstrap.js?v=20260805-consent-v3';
const BOOTSTRAP_TAG = `<script src="${BOOTSTRAP_SRC}"></script>`;

function isPrivacyUnsafeLink(tag) {
  if (/https:\/\/fonts\.(?:googleapis|gstatic)\.com/i.test(tag)) return true;
  return /\brel=["']preconnect["']/i.test(tag) &&
    /https:\/\/(?:www\.)?(?:googletagmanager|google-analytics)\.com|https:\/\/connect\.facebook\.net/i.test(tag);
}

function isDirectTrackingScript(block) {
  const openingTag = (block.match(/^<script\b[^>]*>/i) || [''])[0];
  const src = (openingTag.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
  if (/^https:\/\/www\.googletagmanager\.com\/(?:gtm\.js|gtag\/js)/i.test(src)) return true;
  if (/^https:\/\/connect\.facebook\.net\/.*fbevents\.js/i.test(src)) return true;
  if (/(?:^|\/)js\/tracking\/(?:ads-loader|consent-banner|pixel-init|site-consent-bootstrap|tracking|utm-capture)\.js/i.test(src)) {
    return !src.includes('site-consent-bootstrap.js?v=20260805-consent-v3');
  }
  if (/(?:^|\/)js\/starter-tracking-bootstrap\.js/i.test(src)) return true;

  const body = block.slice(openingTag.length, -'</script>'.length);
  if (/googletagmanager\.com\/gtm\.js/i.test(body)) return true;
  if (/connect\.facebook\.net\/.*fbevents\.js/i.test(body)) return true;
  if (/gtag\(\s*["']js["']/i.test(body) && /gtag\(\s*["']config["']/i.test(body)) return true;
  if (/gtag\(\s*["']consent["']\s*,\s*["']default["']/i.test(body) && /gb_consent_v1/i.test(body)) return true;
  return false;
}

function hardenConsentHtml(html) {
  let output = html;
  // Do not ship unpublished client names, images, quotes, or result figures in the page source.
  output = output.replace(
    /<section class="section transformations-results-section" hidden>[\s\S]*?<!-- Newsletter Section -->/i,
    '<!-- Client proof withheld until evidence and publication permission are verified. -->\n\n<!-- Newsletter Section -->'
  );
  output = output.replace(
    /<div class="starter-transform-grid" hidden>[\s\S]*?<div class="starter-transform-footer">/i,
    '<!-- Client proof withheld until evidence and publication permission are verified. -->\n        <div class="starter-transform-footer">'
  );
  output = output.replace(
    /<div class="starter-transform-grid" hidden>[\s\S]*?<section class="starter-coach-showcase"/i,
    '<!-- Client proof withheld until evidence and publication permission are verified. -->\n        <section class="starter-coach-showcase"'
  );
  output = output.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>\s*/gi, (block) =>
    /googletagmanager\.com\/ns\.html|facebook\.com\/tr\?id=/i.test(block) ? '' : block
  );
  output = output.replace(/<link\b[^>]*>\s*/gi, (tag) => isPrivacyUnsafeLink(tag) ? '' : tag);
  output = output.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/gi, (block) =>
    isDirectTrackingScript(block) ? '' : block
  );
  output = output.replace(/<img\b[^>]*facebook\.com\/tr\?id=[^>]*>\s*/gi, '');

  if (!output.includes(BOOTSTRAP_SRC) && /<head\b[^>]*>/i.test(output)) {
    const charsetPattern = /(<meta\b[^>]*charset=["']?[^>]+>)/i;
    output = charsetPattern.test(output)
      ? output.replace(charsetPattern, `$1\n  ${BOOTSTRAP_TAG}`)
      : output.replace(/(<head\b[^>]*>)/i, `$1\n  ${BOOTSTRAP_TAG}`);
  }
  return output;
}

module.exports = { BOOTSTRAP_SRC, BOOTSTRAP_TAG, hardenConsentHtml };
