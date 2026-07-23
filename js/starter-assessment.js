(function () {
  const QUESTIONS = [
    ['primary_goal', 'What would you most like to achieve right now?', ['Lose body fat', 'Build muscle', 'Improve body composition', 'Become fitter and more energetic', 'Rebuild consistency', 'Not sure yet']],
    ['desired_result', 'Which result would make the biggest difference to you?', ['Feel more confident in my body', 'Lose weight and reduce my waist', 'Look leaner and more defined', 'Build strength and muscle', 'Improve fitness and energy', 'Create a routine I can maintain']],
    ['training_environment', 'Where are you most likely to train?', ['Commercial gym', 'Home with some equipment', 'Home with little or no equipment', 'A mixture of gym and home', 'I am not currently training']],
    ['training_days', 'How many days per week could you realistically train?', ['2 days', '3 days', '4 days', '5 or more days', 'I am unsure']],
    ['main_barrier', 'What is currently making progress most difficult?', ['Nutrition and food choices', 'Lack of consistency', 'Limited time', 'I do not know what programme to follow', 'Motivation and accountability', 'I have stopped seeing progress', 'I am overwhelmed by conflicting information']],
    ['nutrition_support', 'What kind of nutrition guidance would help you most?', ['Simple meal structure', 'Calories and macro targets', 'High-protein food ideas', 'Portion guidance without tracking everything', 'Meal preparation and planning', 'Help controlling cravings and overeating', 'I am unsure']],
    ['starting_timeline', 'When would you ideally like to begin?', ['As soon as possible', 'Within the next two weeks', 'Within the next month', 'I am researching my options', 'I only want the free resources for now']],
    ['support_preference', 'Which type of support are you looking for?', ['A free guide to help me begin', 'A workout and nutrition template', 'A structured programme I can follow', 'A fully tailored coaching plan', 'I would like to speak with Andre first']]
  ];
  const COUNTRIES = ['Ireland', 'United Kingdom', 'United States', 'Canada', 'Australia', 'Portugal', 'Brazil', 'Spain', 'France', 'Germany', 'Netherlands', 'Other'];
  const STORAGE_KEY = 'gb_starter_assessment_answers';
  const META_KEY = 'gb_starter_assessment_meta';
  const LAST_SUBMISSION_KEY = 'gb_starter_last_submission_v1';
  const state = {
    step: -1,
    answers: {},
    turnstileWidgetId: null,
    submitted: false,
    redirecting: false,
    transitionLocked: false,
    submitEventId: ''
  };

  const $ = (selector) => document.querySelector(selector);
  const hero = $('#starter-hero');
  const card = $('[data-assessment-card]');
  const form = $('#starter-assessment-form');
  const questionStep = $('[data-question-step]');
  const contactStep = $('[data-contact-step]');
  const questionText = $('[data-question-text]');
  const optionGrid = $('[data-option-grid]');
  const progressLabel = $('[data-progress-label]');
  const progressPercent = $('[data-progress-percent]');
  const progressBar = $('[data-progress-bar]');
  const backButton = $('[data-back-button]');
  const nextButton = $('[data-next-button]');
  const submitButton = $('[data-submit-button]');
  const errorSummary = $('[data-error-summary]');
  const whatsappInput = $('[data-whatsapp-input]');
  const whatsappConsentRow = $('[data-whatsapp-consent-row]');
  const openCookiePreferencesButton = $('[data-open-cookie-preferences]');
  let lastViewedQuestionId = '';
  let contactViewedTracked = false;

  function track(eventName, properties) {
    const safeProperties = properties || {};
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
  }

  function makeEventId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
      }
    } catch {}
    return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function getEntryContextMeta() {
    if (window.GB_STARTER_ENTRY_CONTEXT && typeof window.GB_STARTER_ENTRY_CONTEXT.buildAttributionMeta === 'function') {
      return window.GB_STARTER_ENTRY_CONTEXT.buildAttributionMeta();
    }
    const params = new URLSearchParams(window.location.search);
    const landingPath = window.location.pathname;
    return {
      entry_context: landingPath.startsWith('/assessment') || landingPath.startsWith('/starter-plan') ? 'paid' : 'organic',
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_content: params.get('utm_content') || null,
      utm_term: params.get('utm_term') || null,
      landing_path: landingPath,
      landing_url: window.location.origin + window.location.pathname,
      referrer: document.referrer || null
    };
  }

  function getMeta() {
    try {
      const existing = JSON.parse(sessionStorage.getItem(META_KEY) || '{}') || {};
      const fresh = getEntryContextMeta();
      const meta = {
        ...existing,
        ...fresh,
        landing_path: fresh.landing_path || existing.landing_path || window.location.pathname
      };
      sessionStorage.setItem(META_KEY, JSON.stringify(meta));
      return meta;
    } catch {
      return { landing_path: window.location.pathname };
    }
  }

  function saveAnswers() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
  }

  function restoreAnswers() {
    try {
      state.answers = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch {
      state.answers = {};
    }
  }

  function showError(message) {
    const visibleContact = !contactStep.hidden;
    if (visibleContact) {
      contactStep.insertBefore(errorSummary, contactStep.querySelector('.field-grid'));
    } else {
      questionStep.insertBefore(errorSummary, optionGrid);
    }
    errorSummary.textContent = message;
    errorSummary.hidden = false;
    errorSummary.focus();
  }

  function clearError() {
    errorSummary.hidden = true;
    errorSummary.textContent = '';
  }

  function setProgress() {
    const total = QUESTIONS.length + 1;
    const current = Math.min(Math.max(state.step + 1, 1), total);
    const percent = Math.round((current / total) * 100);
    progressLabel.textContent = state.step < QUESTIONS.length ? `Question ${current} of ${QUESTIONS.length}` : 'Contact details';
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function renderQuestion() {
    const question = QUESTIONS[state.step];
    const [id, text, options] = question;
    if (lastViewedQuestionId !== id) {
      track('assessment_question_viewed', {
        question_id: id,
        question_number: state.step + 1
      });
      lastViewedQuestionId = id;
    }
    questionText.textContent = text;
    optionGrid.innerHTML = '';
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      button.textContent = option;
      button.setAttribute('aria-pressed', state.answers[id] === option ? 'true' : 'false');
      button.addEventListener('click', () => {
        state.answers[id] = option;
        saveAnswers();
        renderQuestion();
        track('assessment_step_completed', {
          question_id: id,
          question_number: state.step + 1,
          goal_slug: id === 'primary_goal' ? option.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined
        });
      });
      if (index === 0) button.dataset.firstOption = 'true';
      optionGrid.appendChild(button);
    });
  }

  function renderContact() {
    if (!contactViewedTracked) {
      contactViewedTracked = true;
      track('assessment_contact_viewed', {
        entry_context: getMeta().entry_context || 'organic'
      });
    }

    if (!$('[data-country-select]').children.length || $('[data-country-select]').children.length === 1) {
      COUNTRIES.forEach((country) => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        $('[data-country-select]').appendChild(option);
      });
    }
    scheduleTurnstileRender();
  }

  function getPublicEnv(name) {
    return (window.__ENV && window.__ENV[name]) || window[name] || '';
  }

  function renderTurnstile() {
    const slot = $('[data-turnstile-slot]');
    const siteKey = getPublicEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY');
    if (!slot || !siteKey || !window.turnstile || state.turnstileWidgetId !== null) return;
    state.turnstileWidgetId = window.turnstile.render(slot, { sitekey: siteKey });
  }

  function scheduleTurnstileRender() {
    renderTurnstile();
    if (state.turnstileWidgetId !== null) return;

    if (window.__ENV_PROMISE && typeof window.__ENV_PROMISE.then === 'function') {
      window.__ENV_PROMISE.then(renderTurnstile).catch(() => {});
    }

    window.addEventListener('load', renderTurnstile, { once: true });
    setTimeout(renderTurnstile, 500);
    setTimeout(renderTurnstile, 1500);
  }

  function render() {
    clearError();
    setProgress();
    const isContact = state.step >= QUESTIONS.length;
    questionStep.hidden = isContact;
    contactStep.hidden = !isContact;
    nextButton.hidden = isContact;
    submitButton.hidden = !isContact;
    backButton.hidden = state.step <= 0;

    if (isContact) {
      renderContact();
      setTimeout(() => $('[name="first_name"]')?.focus(), 0);
    } else {
      renderQuestion();
      setTimeout(() => $('[data-first-option]')?.focus(), 0);
    }
  }

  function startAssessment() {
    restoreAnswers();
    state.submitted = false;
    state.redirecting = false;
    state.submitEventId = makeEventId();
    state.step = 0;
    hero.hidden = true;
    card.hidden = false;
    track('assessment_started', {
      entry_context: getMeta().entry_context || 'organic',
      resumed: Object.keys(state.answers).length > 0,
      language: document.documentElement.lang || 'en'
    });
    render();
  }

  function validateCurrentQuestion() {
    const id = QUESTIONS[state.step][0];
    if (!state.answers[id]) {
      showError('Choose an answer to continue.');
      return false;
    }
    return true;
  }

  function collectContact() {
    const data = new FormData(form);
    return {
      first_name: String(data.get('first_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      country: String(data.get('country') || '').trim(),
      whatsapp: String(data.get('whatsapp') || '').trim(),
      age_confirmed: data.get('age_confirmed') === 'on',
      resource_delivery_acknowledgement: data.get('resource_delivery_acknowledgement') === 'on',
      marketing_email_consent: data.get('marketing_email_consent') === 'on',
      marketing_whatsapp_consent: data.get('marketing_whatsapp_consent') === 'on'
    };
  }

  function syncWhatsappConsentVisibility() {
    if (!whatsappInput || !whatsappConsentRow) return;
    const hasNumber = String(whatsappInput.value || '').trim().length > 0;
    whatsappConsentRow.hidden = !hasNumber;
    if (!hasNumber) {
      const checkbox = whatsappConsentRow.querySelector('input[name="marketing_whatsapp_consent"]');
      if (checkbox) checkbox.checked = false;
    }
  }

  function validateContact(contact) {
    if (!contact.first_name) return 'Enter your first name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.toLowerCase())) return 'Enter a valid email address.';
    if (!COUNTRIES.includes(contact.country)) return 'Choose your country.';
    if (contact.whatsapp && !/^\+[1-9]\d{7,14}$/.test(contact.whatsapp)) return 'Enter WhatsApp in international format, for example +353871234567.';
    if (!contact.age_confirmed) return 'Confirm you are 18 or older.';
    if (!contact.resource_delivery_acknowledgement) return 'Confirm you want to receive your result and requested resources.';
    return '';
  }

  function getTurnstileToken() {
    if (window.turnstile && state.turnstileWidgetId !== null) {
      return window.turnstile.getResponse(state.turnstileWidgetId);
    }
    return '';
  }

  function isLocalPreviewHost() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  }

  function getApiUnavailableMessage(status) {
    if (isLocalPreviewHost() && [404, 405, 501].includes(Number(status))) {
      return 'Local preview is running without the API. Use Vercel dev or a deploy preview to submit the form; the assessment interface is working.';
    }
    return 'Unable to submit the assessment right now.';
  }

  async function submitAssessment(event) {
    event.preventDefault();
    clearError();
    const contact = collectContact();
    const validationMessage = validateContact(contact);
    if (validationMessage) {
      showError(validationMessage);
      return;
    }
    const turnstileToken = getTurnstileToken();
    if (getPublicEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY') && !turnstileToken) {
      scheduleTurnstileRender();
      showError('Complete the verification check and try again.');
      return;
    }

    track('assessment_submission_started', {
      entry_context: getMeta().entry_context || 'organic',
      event_id: state.submitEventId || makeEventId()
    });

    submitButton.disabled = true;
    submitButton.textContent = 'Preparing result...';
    try {
      const response = await fetch('/api/starter-assessment/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          contact,
          metadata: getMeta(),
          turnstileToken,
          website: String(new FormData(form).get('website') || '')
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        track('assessment_submission_failed', {
          entry_context: getMeta().entry_context || 'organic',
          stage: 'submit_request',
          http_status_category: `${Math.floor(Number(response.status || 0) / 100)}xx`
        });
        throw new Error(payload.error || getApiUnavailableMessage(response.status));
      }
      state.submitted = true;
      state.redirecting = true;
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(META_KEY);
      try {
        sessionStorage.setItem(LAST_SUBMISSION_KEY, new Date().toISOString());
      } catch {}
      track('assessment_submitted', {
        event_id: payload.eventId || state.submitEventId || makeEventId(),
        entry_context: payload.entryContext || getMeta().entry_context || 'organic',
        result_path_slug: payload.recommendation && payload.recommendation.primaryPath,
        lead_temperature_category: payload.leadTemperatureCategory || undefined,
        email_delivery: payload.emailDeliveryStatus || undefined,
        utm_source: getMeta().utm_source || undefined,
        utm_medium: getMeta().utm_medium || undefined,
        utm_campaign: getMeta().utm_campaign || undefined
      });
      window.location.assign(payload.resultUrl || `/start/result/${payload.resultToken}`);
    } catch (error) {
      track('assessment_submission_failed', {
        entry_context: getMeta().entry_context || 'organic',
        stage: 'submit_exception',
        http_status_category: '0xx'
      });
      const offlineMessage = isLocalPreviewHost() && error instanceof TypeError
        ? 'Local preview cannot reach the assessment API. Use Vercel dev or a deploy preview to submit the form.'
        : '';
      showError(offlineMessage || error.message || 'Unable to submit the assessment right now.');
      submitButton.disabled = false;
      submitButton.textContent = 'View My Result';
    }
  }

  window.addEventListener('beforeunload', () => {
    if (!card.hidden && state.step >= 0 && state.step < QUESTIONS.length && !state.submitted && !state.redirecting) {
      track('assessment_abandoned', { question_number: state.step + 1 });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const meta = getMeta();
    if (window.GB_STARTER_ENTRY_CONTEXT && typeof window.GB_STARTER_ENTRY_CONTEXT.hasCampaignSessionChanged === 'function') {
      const changed = window.GB_STARTER_ENTRY_CONTEXT.hasCampaignSessionChanged(meta);
      if (changed) {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    const context = meta.entry_context || 'organic';
    track('assessment_landing_view', {
      entry_context: context,
      utm_source: meta.utm_source || undefined,
      utm_medium: meta.utm_medium || undefined,
      utm_campaign: meta.utm_campaign || undefined,
      language: document.documentElement.lang || 'en',
      page_path: window.location.pathname
    });
    if (context === 'qr') {
      track('qr_landing_view', {
        source_slug: meta.utm_source || 'business_card'
      });
    }

    document.body.dataset.entryContext = context;

    const packagesCard = document.querySelector('[data-qr-only]');
    const organicCard = document.querySelector('[data-organic-only]');
    const paidOnly = context === 'paid';
    if (packagesCard) {
      packagesCard.hidden = context !== 'qr';
    }
    if (organicCard) {
      organicCard.hidden = paidOnly;
    }

    $('[data-start-assessment]')?.addEventListener('click', startAssessment);
    nextButton?.addEventListener('click', () => {
      if (state.transitionLocked) return;
      if (!validateCurrentQuestion()) return;
      state.transitionLocked = true;
      state.step += 1;
      render();
      setTimeout(() => {
        state.transitionLocked = false;
      }, 150);
    });
    backButton?.addEventListener('click', () => {
      state.step = Math.max(0, state.step - 1);
      render();
    });
    form?.addEventListener('submit', submitAssessment);
    whatsappInput?.addEventListener('input', syncWhatsappConsentVisibility);
    syncWhatsappConsentVisibility();

    openCookiePreferencesButton?.addEventListener('click', () => {
      if (typeof window.openConsentPreferences === 'function') {
        window.openConsentPreferences();
      }
    });

    restoreAnswers();
    if (Object.keys(state.answers).length) startAssessment();
  });
})();
