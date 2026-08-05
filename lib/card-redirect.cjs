'use strict';

const CARD_ATTRIBUTION_DEFAULTS = Object.freeze({
  utm_source: 'business_card',
  utm_medium: 'qr',
  utm_campaign: 'starter_assessment'
});

function appendQueryValue(params, key, value) {
  if (Array.isArray(value)) {
    value.forEach((item) => appendQueryValue(params, key, item));
    return;
  }
  if (!['string', 'number', 'boolean'].includes(typeof value)) return;
  params.append(key, String(value));
}

function buildCardRedirectUrl(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => appendQueryValue(params, key, value));

  Object.entries(CARD_ATTRIBUTION_DEFAULTS).forEach(([key, value]) => {
    if (!params.get(key)) params.set(key, value);
  });

  return `/start?${params.toString()}`;
}

function preserveRedirectQuery(destination, query = {}) {
  const absolute = /^[a-z][a-z\d+.-]*:\/\//i.test(destination);
  const url = new URL(destination, 'https://redirect.invalid');
  Object.entries(query).forEach(([key, value]) => appendQueryValue(url.searchParams, key, value));
  return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
}

module.exports = {
  CARD_ATTRIBUTION_DEFAULTS,
  buildCardRedirectUrl,
  preserveRedirectQuery
};
