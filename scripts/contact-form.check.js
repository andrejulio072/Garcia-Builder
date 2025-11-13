#!/usr/bin/env node
/**
 * Basic automated check to ensure the contact form script
 * shows a success message and sends the confirmation email.
 */

const { JSDOM } = require('jsdom');

(async () => {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
    url: 'https://garciabuilder.fitness/contact.html'
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.FormData = dom.window.FormData;
  global.localStorage = (() => {
    const store = new Map();
    return {
      getItem: key => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: key => store.delete(key),
    };
  })();

  const requiredIds = {
    form: 'contact-form',
    sendBtn: 'sendBtn',
    alert: 'form-alert',
    name: 'name',
    email: 'email',
    phone: 'phone',
    goal: 'goal',
    timeline: 'timeline',
    experience: 'experience',
    message: 'message',
    consent: 'consent',
    preferredContact: 'preferredContact',
    budget: 'budget',
    charCount: 'charCount',
  };

  const el = (tag, id) => {
    const node = document.createElement(tag);
    if (id) node.id = id;
    return node;
  };

  const form = el('form', requiredIds.form);
  form.setAttribute('action', '/api/contact');
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
  const timelineSelect = el('select', requiredIds.timeline);
  const experienceSelect = el('select', requiredIds.experience);

  const phoneInput = el('input', requiredIds.phone);
  const preferredSelect = el('select', requiredIds.preferredContact);
  const budgetSelect = el('select', requiredIds.budget);

  const charCount = el('span', requiredIds.charCount);
  charCount.textContent = '0/1200';

  const nameInput = el('input', requiredIds.name);
  const emailInput = el('input', requiredIds.email);
  const messageTextarea = el('textarea', requiredIds.message);
  const consentCheckbox = el('input', requiredIds.consent);
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
  setOptions(timelineSelect, ['4-8 weeks']);
  setOptions(experienceSelect, ['Beginner']);
  setOptions(preferredSelect, ['Email']);
  setOptions(budgetSelect, ['GBP 200-299']);

  form.append(
    sendBtn,
    alertBox,
    nameInput,
    emailInput,
    phoneInput,
    goalSelect,
    timelineSelect,
    experienceSelect,
    messageTextarea,
    consentCheckbox,
    preferredSelect,
    budgetSelect
  );

  document.body.append(form, charCount);

  const fetchCalls = [];
  global.fetch = async (url, options = {}) => {
    fetchCalls.push({ url, options });

    if (url.includes('/api/contact')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true })
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({ ok: true })
    };
  };

  require('../js/components/contact-form.js');

  nameInput.value = 'Test User';
  emailInput.value = 'test@example.com';
  phoneInput.value = '+353871234567';
  goalSelect.value = 'Fat loss';
  timelineSelect.value = '4-8 weeks';
  experienceSelect.value = 'Beginner';
  messageTextarea.value = 'Looking forward to coaching!';
  consentCheckbox.checked = true;
  preferredSelect.value = 'Email';
  budgetSelect.value = 'GBP 200-299';

  const expectedEmail = emailInput.value;
  const expectedName = nameInput.value;

  const submitEvent = new dom.window.Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);

  await new Promise(resolve => setTimeout(resolve, 50));

  if (!alertBox.textContent.includes('Thanks!')) {
    throw new Error(`Unexpected alert message: ${alertBox.textContent}`);
  }

  if (fetchCalls.length < 2) {
    throw new Error('Expected both API and confirmation email fetch calls to occur.');
  }

  const [apiCall, confirmationCall] = fetchCalls;
  if (!apiCall.url.includes('/api/contact')) {
    throw new Error('First fetch was not the API call.');
  }

  const confirmationFormData = confirmationCall.options?.body;
  if (!(confirmationFormData instanceof dom.window.FormData)) {
    throw new Error('Confirmation call did not send FormData.');
  }

  const receivedEmail = confirmationFormData.get('_to');
  if (receivedEmail !== expectedEmail) {
    throw new Error(`Confirmation email target mismatch: ${receivedEmail}`);
  }

  const receivedName = confirmationFormData.get('name');
  if (receivedName !== expectedName) {
    throw new Error(`Confirmation email name mismatch: ${receivedName}`);
  }

  console.log('Contact form automated check passed.');
})();
