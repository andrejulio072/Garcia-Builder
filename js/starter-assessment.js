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
  const SUBMITTED_EVENT_GUARD_KEY = 'gb_assessment_submitted_event_ids_v1';
  const pageMode = document.body?.dataset?.starterPageMode || 'qr';
  const defaultEntryContext = document.body?.dataset?.starterEntryDefault || 'organic';
  const i18n = window.GB_STARTER_I18N;
  const state = {
    step: -1,
    answers: {},
    language: i18n?.getBrowserLanguage?.() || 'en',
    advanceTimer: null,
    transitionDirection: 'forward',
    contactTracked: false,
    entryContext: defaultEntryContext,
    submitted: false,
    submissionId: null,
    campaignKey: ''
  };

  const $ = (selector) => document.querySelector(selector);
  const shell = $('#assessment-root');
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
  const progressTrack = $('[data-progress-track]');
  const progressSegments = Array.from(document.querySelectorAll('[data-progress-segments] li'));
  const progressEncouragement = $('[data-progress-encouragement]');
  const backButton = $('[data-back-button]');
  const submitButton = $('[data-submit-button]');
  const errorSummary = $('[data-error-summary]');

  const PAID_COPY_FALLBACK = {
    heroTrustPaid: 'heroTrust',
    disclaimerPaid: 'disclaimer'
  };

  function copy(key, variables) {
    const value = i18n?.ui?.(key, state.language, variables);
    if (value && value !== key) return value;
    const fallbackKey = PAID_COPY_FALLBACK[key];
    if (fallbackKey) {
      const fallback = i18n?.ui?.(fallbackKey, state.language, variables);
      if (fallback && fallback !== fallbackKey) return fallback;
    }
    return key;
  }

  function translated(value) {
    return i18n?.translateText?.(value, state.language) || value;
  }

  function track(eventName, properties) {
    const safeProperties = {
      language: state.language,
      entry_context: state.entryContext,
      page_mode: pageMode,
      page_path: window.location.pathname,
      ...(properties || {})
    };
    if (window.GB_TRACKING?.trackEvent) {
      window.GB_TRACKING.trackEvent(eventName, safeProperties);
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...safeProperties });
  }

  function getMeta() {
    try {
      const existing = JSON.parse(sessionStorage.getItem(META_KEY) || '{}') || {};
      const captured = window.GB_STARTER_CONTEXT?.getMetadata
        ? window.GB_STARTER_CONTEXT.getMetadata(defaultEntryContext)
        : {
            entry_context: defaultEntryContext,
            landing_path: window.location.pathname,
            landing_url: window.location.href,
            referrer: document.referrer || null
          };
      const meta = {
        ...existing,
        ...captured
      };
      state.entryContext = meta.entry_context || defaultEntryContext;
      state.campaignKey = [meta.entry_context, meta.utm_source, meta.utm_medium, meta.utm_campaign, meta.landing_path]
        .map((value) => String(value || ''))
        .join('|');
      sessionStorage.setItem(META_KEY, JSON.stringify(meta));
      return meta;
    } catch {
      return { entry_context: defaultEntryContext, landing_path: window.location.pathname };
    }
  }

  function saveAnswers() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        campaignKey: state.campaignKey,
        answers: state.answers
      }));
    } catch (_) {}
  }

  function restoreAnswers() {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
      const answers = raw.answers && typeof raw.answers === 'object' ? raw.answers : raw;
      const storedCampaignKey = raw.campaignKey || '';
      state.answers = storedCampaignKey && state.campaignKey && storedCampaignKey !== state.campaignKey
        ? {}
        : (answers || {});
    } catch {
      state.answers = {};
    }
  }

  function renderError(message) {
    const field = arguments[1];
    const visibleContact = !contactStep.hidden;
    if (visibleContact) {
      contactStep.insertBefore(errorSummary, contactStep.querySelector('.field-grid'));
    } else {
      questionStep.insertBefore(errorSummary, optionGrid);
    }
    errorSummary.textContent = message;
    errorSummary.hidden = false;
    if (field) {
      const input = form?.elements?.namedItem?.(field);
      if (input?.setAttribute) input.setAttribute('aria-invalid', 'true');
    }
    errorSummary.focus();
  }

  function trackValidationError(field) {
    const visibleContact = !contactStep.hidden;
    track('assessment_validation_error', {
      stage: visibleContact ? 'contact' : 'question',
      field: field || (visibleContact ? 'contact' : QUESTIONS[state.step]?.[0])
    });
  }

  function clearError() {
    errorSummary.hidden = true;
    errorSummary.textContent = '';
    form?.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
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
    if (progressTrack) {
      progressTrack.setAttribute('aria-valuenow', String(percent));
      progressTrack.setAttribute('aria-valuetext', progressLabel.textContent);
    }
    progressSegments.forEach((segment, index) => {
      segment.classList.toggle('is-complete', index < current - 1);
      segment.classList.toggle('is-active', index === current - 1);
    });
    if (progressEncouragement) {
      progressEncouragement.hidden = state.step < 5 || state.step >= QUESTIONS.length;
    }
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }

  function stageFocusDelay() {
    return prefersReducedMotion() ? 0 : 230;
  }

  function restartStageAnimation(element) {
    if (!element || prefersReducedMotion()) return;
    element.classList.remove('is-stage-entering');
    element.dataset.transitionDirection = state.transitionDirection;
    requestAnimationFrame(() => {
      element.classList.add('is-stage-entering');
      element.addEventListener('animationend', () => element.classList.remove('is-stage-entering'), { once: true });
    });
  }

  function moveToNextQuestion() {
    state.advanceTimer = null;
    state.transitionDirection = 'forward';
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
      const marker = document.createElement('span');
      marker.className = 'option-marker';
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'option-label';
      label.textContent = translated(option);
      const check = document.createElement('span');
      check.className = 'option-check';
      check.setAttribute('aria-hidden', 'true');
      check.innerHTML = '<svg viewBox="0 0 20 20"><path d="m4 10 4 4 8-9"/></svg>';
      button.append(marker, label, check);
      button.setAttribute('aria-pressed', state.answers[id] === option ? 'true' : 'false');
      button.addEventListener('click', () => {
        if (state.advanceTimer) clearTimeout(state.advanceTimer);
        if (button.disabled) return;
        state.answers[id] = option;
        saveAnswers();
        optionGrid.querySelectorAll('.option-card').forEach((item) => {
          item.disabled = true;
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
          item.classList.toggle('is-confirmed', item === button);
          item.classList.toggle('is-muted', item !== button);
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
    restartStageAnimation(questionStep);
    track('assessment_question_viewed', { question_id: id, question_number: state.step + 1 });
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
      restartStageAnimation(contactStep);
      if (!state.contactTracked) {
        track('assessment_contact_viewed', { completed_questions: QUESTIONS.length });
        state.contactTracked = true;
      }
      setTimeout(() => $('[name="full_name"]')?.focus(), stageFocusDelay());
    } else {
      renderQuestion();
      setTimeout(() => $('[data-first-option]')?.focus(), stageFocusDelay());
    }
  }

  function startAssessment() {
    getMeta();
    restoreAnswers();
    const unansweredIndex = QUESTIONS.findIndex(([id]) => !state.answers[id]);
    state.step = unansweredIndex === -1 ? QUESTIONS.length : unansweredIndex;
    card.hidden = false;
    shell?.classList.add('is-assessment-active');
    hero?.classList.add('is-hero-exiting');
    card.classList.add('is-assessment-entering');
    setTimeout(() => {
      hero.hidden = true;
      hero.classList.remove('is-hero-exiting');
      card.classList.remove('is-assessment-entering');
      card.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }, prefersReducedMotion() ? 0 : 300);
    track('assessment_started', { resumed: Object.keys(state.answers).length > 0 });
    render();
  }

  function collectContact() {
    const data = new FormData(form);
    return {
      full_name: String(data.get('full_name') || '').trim(),
      age: String(data.get('age') || '').trim(),
      email: String(data.get('email') || '').trim(),
      whatsapp: String(data.get('whatsapp') || '').trim(),
      instagram_handle: String(data.get('instagram_handle') || '').trim(),
      facebook_profile: String(data.get('facebook_profile') || '').trim(),
      preferred_contact_method: String(data.get('preferred_contact_method') || '').trim(),
      best_contact_time: String(data.get('best_contact_time') || '').trim(),
      resource_delivery_acknowledgement: data.get('resource_delivery_acknowledgement') === 'on',
      marketing_email_consent: data.get('marketing_email_consent') === 'on'
    };
  }

  function getSubmissionId() {
    if (state.submissionId) return state.submissionId;
    const cryptoApi = globalThis.crypto;
    if (typeof cryptoApi?.randomUUID === 'function') {
      state.submissionId = cryptoApi.randomUUID();
      return state.submissionId;
    }
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    state.submissionId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    return state.submissionId;
  }

  function validateContact(contact) {
    if (!contact.full_name || contact.full_name.length < 2) return { message: copy('enterName'), field: 'full_name' };
    if (!contact.age) return { message: copy('enterAge'), field: 'age' };
    if (!/^\d+$/.test(contact.age) || !Number.isInteger(Number(contact.age))) return { message: copy('validAge'), field: 'age' };
    if (Number(contact.age) < 18 || Number(contact.age) > 100) return { message: copy('ageRange'), field: 'age' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.toLowerCase())) return { message: copy('validEmail'), field: 'email' };
    if (contact.whatsapp && !/^\+[1-9]\d{7,14}$/.test(contact.whatsapp)) return { message: copy('validWhatsapp'), field: 'whatsapp' };
    if (contact.instagram_handle && contact.instagram_handle.length > 180) return { message: copy('validInstagram'), field: 'instagram_handle' };
    if (contact.facebook_profile && contact.facebook_profile.length > 180) return { message: copy('validFacebook'), field: 'facebook_profile' };
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

  function classifyStatusCategory(error) {
    if (error instanceof TypeError) return 'network';
    const status = Number(error?.status || 0);
    if (status >= 400 && status < 500) return '4xx';
    if (status >= 500 && status < 600) return '5xx';
    return 'unknown';
  }

  function shouldTrackCanonicalSubmission(payload) {
    return Boolean(
      payload?.ok === true &&
      payload?.leadSaved === true &&
      payload?.isNewLead === true &&
      payload?.deduplicated === false &&
      payload?.ignored === false &&
      payload?.eventId &&
      payload?.resultToken &&
      payload?.resultUrl
    );
  }

  function hasTrackedEventId(eventId) {
    if (!eventId) return false;
    try {
      const raw = sessionStorage.getItem(SUBMITTED_EVENT_GUARD_KEY);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) && parsed.includes(eventId);
    } catch {
      return false;
    }
  }

  function markTrackedEventId(eventId) {
    if (!eventId) return;
    try {
      const raw = sessionStorage.getItem(SUBMITTED_EVENT_GUARD_KEY);
      const parsed = JSON.parse(raw || '[]');
      const next = Array.isArray(parsed) ? parsed.slice(0, 30) : [];
      if (!next.includes(eventId)) next.push(eventId);
      sessionStorage.setItem(SUBMITTED_EVENT_GUARD_KEY, JSON.stringify(next));
    } catch (_) {}
  }

  async function submitAssessment(event) {
    event.preventDefault();
    if (state.submitted || submitButton.disabled) return;
    clearError();
    const contact = collectContact();
    const validationError = validateContact(contact);
    if (validationError) {
      trackValidationError(validationError.field);
      renderError(validationError.message, validationError.field);
      return;
    }
    submitButton.disabled = true;
    submitButton.dataset.loading = 'true';
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = copy('preparing');
    track('assessment_submission_started', {
      has_whatsapp: Boolean(contact.whatsapp),
      has_instagram: Boolean(contact.instagram_handle),
      has_facebook: Boolean(contact.facebook_profile),
      preferred_contact_method: contact.preferred_contact_method || 'none'
    });
    try {
      const response = await fetch('/api/starter-assessment/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          answers: state.answers,
          contact,
          submission_id: getSubmissionId(),
          language: state.language,
          metadata: getMeta(),
          website: String(new FormData(form).get('website') || '')
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        const error = new Error(payload.error || getApiUnavailableMessage(response.status));
        error.status = response.status;
        throw error;
      }

      if (payload.ignored) {
        track('assessment_submission_ignored', { reason: 'honeypot' });
        renderError(copy('submitUnavailable'));
        submitButton.disabled = false;
        delete submitButton.dataset.loading;
        submitButton.removeAttribute('aria-busy');
        submitButton.textContent = copy('viewResult');
        return;
      }

      if (!payload.leadSaved || !payload.resultToken || !payload.resultUrl) {
        const error = new Error(copy('submitUnavailable'));
        error.status = response.status || 500;
        throw error;
      }

      try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
      state.submitted = true;
      if (payload.deduplicated) {
        track('assessment_submission_deduplicated', {
          event_id: payload.eventId,
          entry_context: payload.attribution?.entry_context || state.entryContext
        });
      }

      const canTrackPrimary = shouldTrackCanonicalSubmission(payload) && !hasTrackedEventId(payload.eventId);
      if (canTrackPrimary) {
        track('assessment_submitted', {
          event_id: payload.eventId,
          entry_context: payload.attribution?.entry_context || state.entryContext,
          language: state.language,
          utm_source: payload.attribution?.utm_source || getMeta().utm_source || undefined,
          utm_medium: payload.attribution?.utm_medium || getMeta().utm_medium || undefined,
          utm_campaign: payload.attribution?.utm_campaign || getMeta().utm_campaign || undefined,
          utm_content: payload.attribution?.utm_content || getMeta().utm_content || undefined,
          utm_term: payload.attribution?.utm_term || getMeta().utm_term || undefined,
          result_path_slug: payload.recommendation?.primaryPath
        });
        // Compatibility event for the currently published GTM conversion
        // tags. assessment_submitted remains the canonical durable event;
        // generate_lead is emitted once with the same server event id.
        track('generate_lead', {
          event_id: payload.eventId,
          conversion_source: 'assessment_submitted',
          lead_type: 'starter_assessment',
          entry_context: payload.attribution?.entry_context || state.entryContext,
          language: state.language,
          utm_source: payload.attribution?.utm_source || getMeta().utm_source || undefined,
          utm_medium: payload.attribution?.utm_medium || getMeta().utm_medium || undefined,
          utm_campaign: payload.attribution?.utm_campaign || getMeta().utm_campaign || undefined,
          utm_content: payload.attribution?.utm_content || getMeta().utm_content || undefined,
          utm_term: payload.attribution?.utm_term || getMeta().utm_term || undefined,
          result_path_slug: payload.recommendation?.primaryPath
        });
        markTrackedEventId(payload.eventId);
      }

      if (payload.resultToken && payload.resourceDelivery?.email) {
        try { sessionStorage.setItem(`${DELIVERY_KEY_PREFIX}${payload.resultToken}`, payload.resourceDelivery.email); } catch (_) {}
      }
      delete submitButton.dataset.loading;
      submitButton.removeAttribute('aria-busy');
      submitButton.dataset.success = 'true';
      submitButton.textContent = copy('resultReady');
      window.location.assign(payload.resultUrl);
    } catch (error) {
      const offlineMessage = isLocalPreviewHost() && error instanceof TypeError ? copy('localApi') : '';
      track('assessment_submission_failed', {
        reason: error instanceof TypeError ? 'network' : 'api_or_persistence',
        stage: 'submit',
        status_category: classifyStatusCategory(error)
      });
      renderError(offlineMessage || error.message || copy('submitUnavailable'));
      submitButton.disabled = false;
      delete submitButton.dataset.loading;
      submitButton.removeAttribute('aria-busy');
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
    if (!state.submitted && !card.hidden && state.step >= 0) {
      track('assessment_abandoned', {
        stage: state.step >= QUESTIONS.length ? 'contact' : 'question',
        question_number: Math.min(state.step + 1, QUESTIONS.length)
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    i18n?.applyDocument?.(state.language);
    const meta = getMeta();
    track('assessment_landing_view', {
      utm_source: meta.utm_source || undefined,
      utm_medium: meta.utm_medium || undefined,
      utm_campaign: meta.utm_campaign || undefined
    });
    if (state.entryContext === 'qr') {
      track('qr_landing_view', { source_slug: meta.utm_source || 'business_card' });
    }
    document.querySelectorAll('[data-start-assessment], [data-start-assessment-proof]').forEach((button) => {
      button.addEventListener('click', startAssessment);
    });
    backButton?.addEventListener('click', () => {
      if (state.advanceTimer) clearTimeout(state.advanceTimer);
      state.advanceTimer = null;
      state.transitionDirection = 'back';
      state.step = Math.max(0, state.step - 1);
      render();
    });
    document.querySelectorAll('[data-starter-language]').forEach((selector) => {
      selector.addEventListener('change', (event) => applyLanguage(event.target.value));
    });
    form?.addEventListener('submit', submitAssessment);
    restoreAnswers();
    if (Object.keys(state.answers).some((key) => QUESTIONS.some(([id]) => id === key))) startAssessment();
    document.querySelectorAll('[data-open-cookie-preferences]').forEach((button) => {
      button.addEventListener('click', () => {
        if (typeof window.openConsentPreferences === 'function') {
          window.openConsentPreferences();
        }
      });
    });
  });
})();
