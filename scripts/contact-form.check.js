#!/usr/bin/env node
/**
 * Basic automated check to ensure the contact form script
 * posts the CRM/Zapier consultation payload through /api/lead.
 */

const { JSDOM } = require('jsdom');

(async () => {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
    url: 'https://garciabuilder.fitness/contact.html'
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  window.__GB_DISABLE_FORM_REDIRECT = true;
  global.FormData = dom.window.FormData;
  global.localStorage = (() => {
    const store = new Map();
    return {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key),
    };
  })();
  global.bootstrap = {
    Modal: class {
      constructor(element) {
        this.element = element;
      }
      show() {}
      hide() {
        this.element.dispatchEvent(new dom.window.Event('hidden.bs.modal'));
      }
    }
  };

  const requiredIds = {
    form: 'contact-form',
    sendBtn: 'sendBtn',
    alert: 'form-alert',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    goal: 'goal',
    currentWeight: 'currentWeight',
    mainStruggle: 'mainStruggle',
    trainingLocation: 'trainingLocation',
    startTimeline: 'startTimeline',
    investmentReadiness: 'investmentReadiness',
    consent: 'consent',
    source: 'source',
    page: 'page',
    utmSource: 'utm_source',
    utmCampaign: 'utm_campaign',
  };

  const el = (tag, id) => {
    const node = document.createElement(tag);
    if (id) node.id = id;
    return node;
  };

  const form = el('form', requiredIds.form);
  form.setAttribute('action', '/api/lead');
  form.setAttribute('method', 'POST');

  const sendBtn = el('button', requiredIds.sendBtn);
  sendBtn.dataset.default = 'Send';
  sendBtn.dataset.loading = 'Sending...';
  const btnLabelSpan = document.createElement('span');
  btnLabelSpan.dataset.i18n = 'contact.form.submit';
  btnLabelSpan.textContent = 'Send';
  sendBtn.appendChild(btnLabelSpan);

  const alertBox = el('div', requiredIds.alert);
  alertBox.className = 'visually-hidden';

  const goalSelect = el('select', requiredIds.goal);
  const trainingLocationSelect = el('select', requiredIds.trainingLocation);
  const startTimelineSelect = el('select', requiredIds.startTimeline);
  const investmentReadinessSelect = el('select', requiredIds.investmentReadiness);

  const phoneInput = el('input', requiredIds.phone);
  const currentWeightInput = el('input', requiredIds.currentWeight);
  const mainStruggleInput = el('input', requiredIds.mainStruggle);
  const firstNameInput = el('input', requiredIds.firstName);
  const lastNameInput = el('input', requiredIds.lastName);
  const emailInput = el('input', requiredIds.email);
  const consentCheckbox = el('input', requiredIds.consent);
  const sourceInput = el('input', requiredIds.source);
  const pageInput = el('input', requiredIds.page);
  const utmSourceInput = el('input', requiredIds.utmSource);
  const utmCampaignInput = el('input', requiredIds.utmCampaign);
  consentCheckbox.type = 'checkbox';

  const setOptions = (select, values) => {
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  };

  setOptions(goalSelect, ['Fat loss']);
  setOptions(trainingLocationSelect, ['Gym']);
  setOptions(startTimelineSelect, ['Within 2 weeks']);
  setOptions(investmentReadinessSelect, ['Ready now']);

  currentWeightInput.type = 'number';
  sourceInput.value = 'website';

  form.append(
    sendBtn,
    alertBox,
    firstNameInput,
    lastNameInput,
    emailInput,
    phoneInput,
    goalSelect,
    currentWeightInput,
    mainStruggleInput,
    trainingLocationSelect,
    startTimelineSelect,
    investmentReadinessSelect,
    consentCheckbox,
    sourceInput,
    pageInput,
    utmSourceInput,
    utmCampaignInput
  );

  document.body.append(form);

  const fetchCalls = [];
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });

    if (url.includes('/api/lead')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true, message: 'Thanks — your application has been received. I\'ll review your goal and get back to you.' })
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true })
    };
  };

  require('../js/components/contact-form-enhanced.js');

  firstNameInput.value = 'Test';
  lastNameInput.value = 'User';
  emailInput.value = 'test@example.com';
  phoneInput.value = '+353871234567';
  goalSelect.value = 'Fat loss';
  currentWeightInput.value = '82.5';
  mainStruggleInput.value = 'Consistency';
  trainingLocationSelect.value = 'Gym';
  startTimelineSelect.value = 'Within 2 weeks';
  investmentReadinessSelect.value = 'Ready now';
  consentCheckbox.checked = true;
  window.history.replaceState({}, '', 'https://garciabuilder.fitness/contact.html?utm_source=google&utm_campaign=summer-cut');

  const submitEvent = new dom.window.Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);

  await new Promise(resolve => setTimeout(resolve, 50));

  if (!alertBox.textContent.includes('Thanks — your application has been received.')) {
    throw new Error(`Unexpected alert message: ${alertBox.textContent}`);
  }

  if (fetchCalls.length !== 1) {
    throw new Error(`Expected one API call, got ${fetchCalls.length}.`);
  }

  const [apiCall] = fetchCalls;
  if (!apiCall.url.includes('/api/lead')) {
    throw new Error('First fetch was not the API call.');
  }

  const payload = JSON.parse(apiCall.options?.body || '{}');
  const expectedFields = [
    'lead_id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'goal',
    'currentWeight',
    'mainStruggle',
    'trainingLocation',
    'startTimeline',
    'investmentReadiness',
    'source',
    'page',
    'utm_source',
    'utm_campaign',
    'gclid',
    'fbclid',
    'consent'
  ];

  for (const field of expectedFields) {
    if (!(field in payload)) {
      throw new Error(`Missing payload field: ${field}`);
    }
  }

  if (payload.source !== 'website') {
    throw new Error(`Unexpected source value: ${payload.source}`);
  }

  if (payload.utm_source !== 'google' || payload.utm_campaign !== 'summer-cut') {
    throw new Error(`Unexpected attribution payload: ${JSON.stringify({ utm_source: payload.utm_source, utm_campaign: payload.utm_campaign })}`);
  }

  if (payload.page !== '/contact.html') {
    throw new Error(`Unexpected page value: ${payload.page}`);
  }

  if (!payload.lead_id) {
    throw new Error('Expected frontend payload to include lead_id.');
  }

  form.dispatchEvent(submitEvent);
  await new Promise(resolve => setTimeout(resolve, 20));
  if (fetchCalls.length !== 1) {
    throw new Error(`Expected in-flight duplicate submit to be ignored, got ${fetchCalls.length} calls.`);
  }

  console.log('Contact form automated check passed.');
})();
