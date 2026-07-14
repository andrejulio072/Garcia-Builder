(function () {
  const QUESTIONS = [
    ['primary_goal', 'What would you most like to achieve right now?', ['Lose body fat', 'Build muscle', 'Improve body composition', 'Become fitter and more energetic', 'Rebuild consistency', 'Not sure yet']],
    ['training_environment', 'Where are you most likely to train?', ['Commercial gym', 'Home with some equipment', 'Home with little or no equipment', 'A mixture of gym and home', 'I am not currently training']],
    ['training_days', 'How many days per week could you realistically train?', ['2 days', '3 days', '4 days', '5 or more days', 'I am unsure']],
    ['main_barrier', 'What is currently making progress most difficult?', ['Nutrition and food choices', 'Lack of consistency', 'Limited time', 'I do not know what programme to follow', 'Motivation and accountability', 'I have stopped seeing progress', 'I am overwhelmed by conflicting information']],
    ['nutrition_support', 'What kind of nutrition guidance would help you most?', ['Simple meal structure', 'Calories and macro targets', 'High-protein food ideas', 'Portion guidance without tracking everything', 'Meal preparation and planning', 'Help controlling cravings and overeating', 'I am unsure']],
    ['starting_timeline', 'When would you ideally like to begin?', ['As soon as possible', 'Within the next two weeks', 'Within the next month', 'I am researching my options', 'I only want the free resources for now']],
    ['support_preference', 'Which type of support are you looking for?', ['A free guide to help me begin', 'A workout and nutrition template', 'A structured programme I can follow', 'A fully tailored coaching plan', 'I would like to speak with Andre first']]
  ];
  const STORAGE_KEY = 'gb_starter_assessment_answers';
  const META_KEY = 'gb_starter_assessment_meta';
  const DELIVERY_KEY_PREFIX = 'gb_starter_delivery_';
  const i18n = window.GB_STARTER_I18N;
  const state = {
    step: -1,
    answers: {},
    language: i18n?.getBrowserLanguage?.() || 'en',
    advanceTimer: null,
    contactTracked: false
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
  const submitButton = $('[data-submit-button]');
  const errorSummary = $('[data-error-summary]');
  const whatsappInput = $('[name="whatsapp"]');
  const whatsappConsent = $('[data-whatsapp-consent]');

  function copy(key, variables) {
    return i18n?.ui?.(key, state.language, variables) || key;
  }

  function translated(value) {
    return i18n?.translateText?.(value, state.language) || value;
  }

  function track(eventName, properties) {
    const safeProperties = { language: state.language, ...(properties || {}) };
    if (window.GB_TRACKING?.trackEvent) {
      window.GB_TRACKING.trackEvent(eventName, safeProperties);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
  }

  function getMeta() {
    try {
      const existing = JSON.parse(sessionStorage.getItem(META_KEY) || '{}');
      const params = new URLSearchParams(window.location.search);
      const attribution = window.GB_TRACKING?.getAttribution?.() || {};
      const meta = {
        utm_source: params.get('utm_source') || attribution.utm_source || existing.utm_source || '',
        utm_medium: params.get('utm_medium') || attribution.utm_medium || existing.utm_medium || '',
        utm_campaign: params.get('utm_campaign') || attribution.utm_campaign || existing.utm_campaign || '',
        utm_content: params.get('utm_content') || attribution.utm_content || existing.utm_content || '',
        utm_term: params.get('utm_term') || attribution.utm_term || existing.utm_term || '',
        referrer: existing.referrer || document.referrer || '',
        landing_path: existing.landing_path || window.location.pathname
      };
      sessionStorage.setItem(META_KEY, JSON.stringify(meta));
      return meta;
    } catch {
      return { landing_path: window.location.pathname };
    }
  }

  function saveAnswers() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers)); } catch (_) {}
  }

  function restoreAnswers() {
    try {
      state.answers = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch {
      state.answers = {};
    }
  }

  function showError(message, field) {
    const visibleContact = !contactStep.hidden;
    if (visibleContact) {
      contactStep.insertBefore(errorSummary, contactStep.querySelector('.field-grid'));
    } else {
      questionStep.insertBefore(errorSummary, optionGrid);
    }
    errorSummary.textContent = message;
    errorSummary.hidden = false;
    errorSummary.focus();
    track('assessment_validation_error', {
      stage: visibleContact ? 'contact' : 'question',
      field: field || (visibleContact ? 'contact' : QUESTIONS[state.step]?.[0])
    });
  }

  function clearError() {
    errorSummary.hidden = true;
    errorSummary.textContent = '';
  }

  function setProgress() {
    const total = QUESTIONS.length + 1;
    const current = Math.min(Math.max(state.step + 1, 1), total);
    const percent = Math.round((current / total) * 100);
    progressLabel.textContent = state.step < QUESTIONS.length
      ? copy('questionProgress', { current, total: QUESTIONS.length })
      : copy('contactProgress');
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }

  function moveToNextQuestion() {
    state.advanceTimer = null;
    state.step += 1;
    render();
  }

  function renderQuestion() {
    const question = QUESTIONS[state.step];
    const [id, text, options] = question;
    questionText.textContent = translated(text);
    optionGrid.innerHTML = '';
    options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-card';
      button.textContent = translated(option);
      button.setAttribute('aria-pressed', state.answers[id] === option ? 'true' : 'false');
      button.addEventListener('click', () => {
        if (state.advanceTimer) clearTimeout(state.advanceTimer);
        state.answers[id] = option;
        saveAnswers();
        optionGrid.querySelectorAll('.option-card').forEach((item) => {
          item.disabled = true;
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        track('assessment_step_completed', {
          question_id: id,
          question_number: state.step + 1,
          goal_slug: id === 'primary_goal' ? option.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined
        });
        state.advanceTimer = setTimeout(moveToNextQuestion, 260);
      });
      if (index === 0) button.dataset.firstOption = 'true';
      optionGrid.appendChild(button);
    });
    track('assessment_question_viewed', { question_id: id, question_number: state.step + 1 });
  }

  function syncWhatsappConsent() {
    const hasWhatsapp = Boolean(String(whatsappInput?.value || '').trim());
    if (whatsappConsent) whatsappConsent.hidden = !hasWhatsapp;
    if (!hasWhatsapp) {
      const checkbox = whatsappConsent?.querySelector('input');
      if (checkbox) checkbox.checked = false;
    }
  }

  function render() {
    clearError();
    setProgress();
    const isContact = state.step >= QUESTIONS.length;
    questionStep.hidden = isContact;
    contactStep.hidden = !isContact;
    submitButton.hidden = !isContact;
    backButton.hidden = state.step <= 0;

    if (isContact) {
      syncWhatsappConsent();
      if (!state.contactTracked) {
        track('assessment_contact_viewed', { completed_questions: QUESTIONS.length });
        state.contactTracked = true;
      }
      setTimeout(() => $('[name="first_name"]')?.focus(), 0);
    } else {
      renderQuestion();
      setTimeout(() => $('[data-first-option]')?.focus(), 0);
    }
  }

  function startAssessment() {
    restoreAnswers();
    const unansweredIndex = QUESTIONS.findIndex(([id]) => !state.answers[id]);
    state.step = unansweredIndex === -1 ? QUESTIONS.length : unansweredIndex;
    hero.hidden = true;
    card.hidden = false;
    track('assessment_started', { resumed: Object.keys(state.answers).length > 0 });
    render();
  }

  function collectContact() {
    const data = new FormData(form);
    return {
      first_name: String(data.get('first_name') || '').trim(),
      email: String(data.get('email') || '').trim(),
      whatsapp: String(data.get('whatsapp') || '').trim(),
      age_confirmed: data.get('age_confirmed') === 'on',
      resource_delivery_acknowledgement: data.get('resource_delivery_acknowledgement') === 'on',
      marketing_email_consent: data.get('marketing_email_consent') === 'on',
      marketing_whatsapp_consent: data.get('marketing_whatsapp_consent') === 'on'
    };
  }

  function validateContact(contact) {
    if (!contact.first_name) return { message: copy('enterName'), field: 'first_name' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.toLowerCase())) return { message: copy('validEmail'), field: 'email' };
    if (contact.whatsapp && !/^\+[1-9]\d{7,14}$/.test(contact.whatsapp)) return { message: copy('validWhatsapp'), field: 'whatsapp' };
    if (!contact.age_confirmed) return { message: copy('confirmAge'), field: 'age_confirmed' };
    if (!contact.resource_delivery_acknowledgement) return { message: copy('confirmDelivery'), field: 'resource_delivery_acknowledgement' };
    return null;
  }

  function isLocalPreviewHost() {
    return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  }

  function getApiUnavailableMessage(status) {
    if (isLocalPreviewHost() && [404, 405, 501].includes(Number(status))) return copy('localApi');
    return copy('submitUnavailable');
  }

  async function submitAssessment(event) {
    event.preventDefault();
    clearError();
    const contact = collectContact();
    const validationError = validateContact(contact);
    if (validationError) {
      showError(validationError.message, validationError.field);
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = copy('preparing');
    track('assessment_submission_started', {
      has_whatsapp: Boolean(contact.whatsapp),
      marketing_email_consent: contact.marketing_email_consent,
      marketing_whatsapp_consent: contact.marketing_whatsapp_consent
    });
    try {
      const response = await fetch('/api/starter-assessment/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          contact,
          language: state.language,
          metadata: getMeta(),
          website: String(new FormData(form).get('website') || '')
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.error || getApiUnavailableMessage(response.status));
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
      track('assessment_submitted', {
        result_path_slug: payload.recommendation?.primaryPath,
        email_delivery: payload.resourceDelivery?.email || 'unknown'
      });
      if (payload.resultToken && payload.resourceDelivery?.email) {
        try { sessionStorage.setItem(`${DELIVERY_KEY_PREFIX}${payload.resultToken}`, payload.resourceDelivery.email); } catch (_) {}
      }
      window.location.assign(payload.resultUrl || `/start/result/${payload.resultToken}`);
    } catch (error) {
      const offlineMessage = isLocalPreviewHost() && error instanceof TypeError ? copy('localApi') : '';
      track('assessment_submission_failed', { reason: error instanceof TypeError ? 'network' : 'api' });
      showError(offlineMessage || error.message || copy('submitUnavailable'), 'submission');
      submitButton.disabled = false;
      submitButton.textContent = copy('viewResult');
    }
  }

  function applyLanguage(language) {
    state.language = i18n?.setBrowserLanguage?.(language) || language || 'en';
    i18n?.applyDocument?.(state.language);
    if (!card.hidden && state.step >= 0) render();
    track('assessment_language_selected', { selected_language: state.language });
  }

  window.addEventListener('beforeunload', () => {
    if (!card.hidden && state.step >= 0) {
      track('assessment_abandoned', {
        stage: state.step >= QUESTIONS.length ? 'contact' : 'question',
        question_number: Math.min(state.step + 1, QUESTIONS.length)
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    i18n?.applyDocument?.(state.language);
    getMeta();
    track('qr_landing_view', { source_slug: new URLSearchParams(window.location.search).get('utm_source') || 'direct' });
    $('[data-start-assessment]')?.addEventListener('click', startAssessment);
    backButton?.addEventListener('click', () => {
      if (state.advanceTimer) clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
      state.step = Math.max(0, state.step - 1);
      render();
    });
    whatsappInput?.addEventListener('input', syncWhatsappConsent);
    document.querySelectorAll('[data-starter-language]').forEach((selector) => {
      selector.addEventListener('change', (event) => applyLanguage(event.target.value));
    });
    form?.addEventListener('submit', submitAssessment);
    restoreAnswers();
    if (Object.keys(state.answers).some((key) => QUESTIONS.some(([id]) => id === key))) startAssessment();
  });
})();
