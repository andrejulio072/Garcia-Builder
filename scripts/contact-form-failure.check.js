#!/usr/bin/env node
const { JSDOM } = require('jsdom');

(async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://garciabuilder.fitness/contact.html'
  });

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.FormData = dom.window.FormData;
  global.localStorage = {
    _data: new Map(),
    getItem(key) { return this._data.has(key) ? this._data.get(key) : null; },
    setItem(key, value) { this._data.set(key, String(value)); },
    removeItem(key) { this._data.delete(key); }
  };
  window.dataLayer = [];
  let gtagCalled = false;
  global.fbq = () => {};
  window.gtag = () => { gtagCalled = true; };
  global.bootstrap = {
    Modal: class {
      show() {}
      hide() {}
    }
  };

  const form = document.createElement('form');
  form.id = 'contact-form';

  const mkInput = (id, value = '', type = 'text') => {
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.value = value;
    return input;
  };

  const mkSelect = (id, value) => {
    const select = document.createElement('select');
    select.id = id;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
    select.value = value;
    return select;
  };

  const sendBtn = document.createElement('button');
  sendBtn.id = 'sendBtn';
  sendBtn.dataset.default = 'Send';
  sendBtn.dataset.loading = 'Sending...';
  const label = document.createElement('span');
  label.dataset.i18n = 'contact.form.submit';
  label.textContent = 'Send';
  sendBtn.appendChild(label);

  const alertBox = document.createElement('div');
  alertBox.id = 'form-alert';
  alertBox.className = 'visually-hidden';

  form.appendChild(sendBtn);
  form.appendChild(alertBox);
  form.appendChild(mkInput('firstName', 'Test'));
  form.appendChild(mkInput('lastName', 'User'));
  form.appendChild(mkInput('email', 'test@example.com', 'email'));
  form.appendChild(mkInput('phone', '+353871234567'));
  form.appendChild(mkSelect('goal', 'Fat loss'));
  form.appendChild(mkInput('currentWeight', '82'));
  form.appendChild(mkInput('mainStruggle', 'Consistency'));
  form.appendChild(mkSelect('trainingLocation', 'Gym'));
  form.appendChild(mkSelect('startTimeline', 'Within 2 weeks'));
  form.appendChild(mkSelect('investmentReadiness', 'Ready now'));
  const consent = mkInput('consent', 'on', 'checkbox');
  consent.checked = true;
  form.appendChild(consent);
  form.appendChild(mkInput('source', 'website'));
  form.appendChild(mkInput('page', '/contact.html'));
  form.appendChild(mkInput('utm_source', 'google'));
  form.appendChild(mkInput('utm_medium', 'cpc'));
  form.appendChild(mkInput('utm_campaign', 'test_campaign'));
  form.appendChild(mkInput('utm_content', 'a'));
  form.appendChild(mkInput('utm_term', 'coach'));

  document.body.appendChild(form);

  global.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({ ok: false, error: 'Server error' })
  });

  require('../js/components/contact-form-enhanced.js');

  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!String(alertBox.textContent || '').toLowerCase().includes('something went wrong')) {
    throw new Error(`Expected failure message on 500, got: ${alertBox.textContent}`);
  }

  const events = window.dataLayer.map((entry) => entry.event).filter(Boolean);
  if (events.includes('generate_lead') || events.includes('application_submit')) {
    throw new Error(`Conversion events should not fire on failed API responses: ${events.join(',')}`);
  }

  if (gtagCalled) {
    throw new Error('gtag conversion should not run on failed API responses');
  }

  console.log('Contact form failure-path check passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
