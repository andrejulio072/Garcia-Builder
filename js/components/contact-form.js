(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const btn = document.getElementById('sendBtn');
  const alertBox = document.getElementById('form-alert');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const goalEl = document.getElementById('goal');
  const timelineEl = document.getElementById('timeline');
  const experienceEl = document.getElementById('experience');
  const messageEl = document.getElementById('message');
  const consentEl = document.getElementById('consent');
  const preferredContactEl = document.getElementById('preferredContact');
  const budgetEl = document.getElementById('budget');
  const charCount = document.getElementById('charCount');
  const btnLabel = btn ? btn.querySelector('[data-i18n="contact.form.submit"]') : null;

  if (!btn || !alertBox || !nameEl || !emailEl || !goalEl ||
      !timelineEl || !experienceEl || !messageEl || !consentEl) {
    console.warn('Contact form: required elements are missing');
    return;
  }

  const updateCount = () => {
    if (charCount) {
      charCount.textContent = `${messageEl.value.length}/1200`;
    }
  };
  messageEl.addEventListener('input', updateCount);
  updateCount();

  const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const phoneOk = value => !value || /^[+0-9\s\-()]{6,24}$/.test(value.trim());
  const setErr = (el, on) => el.classList.toggle('input-error', !!on);

  const getErrorMessage = () => {
    const errors = [];
    if (nameEl.classList.contains('input-error')) errors.push('name');
    if (emailEl.classList.contains('input-error')) errors.push('email');
    if (phoneEl && phoneEl.classList.contains('input-error')) errors.push('phone number');
    if (goalEl.classList.contains('input-error')) errors.push('primary goal');
    if (timelineEl.classList.contains('input-error')) errors.push('timeline');
    if (experienceEl.classList.contains('input-error')) errors.push('training experience');
    if (messageEl.classList.contains('input-error')) errors.push('message');
    if (consentEl.classList.contains('input-error')) errors.push('consent agreement');
    return errors.length ? `Please check: ${errors.join(', ')}` : 'Please check the highlighted fields.';
  };

  const canSubmit = () => {
    const last = Number(localStorage.getItem('gb_last_submit') || 0);
    return Date.now() - last > 60_000;
  };

  const setButtonState = loading => {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('is-loading', loading);
    if (btnLabel && btn.dataset) {
      if (loading && btn.dataset.loading) {
        btnLabel.textContent = btn.dataset.loading;
      } else if (!loading && btn.dataset.default) {
        btnLabel.textContent = btn.dataset.default;
      }
    }
  };

  const showMessage = text => {
    alertBox.classList.remove('visually-hidden');
    alertBox.textContent = text;
  };

  const sendConfirmationEmail = async (userName, userEmail) => {
    const lines = [
      `Hi ${userName},`,
      '',
      "Thank you for reaching out! I've received your message and will get back to you within 24-48 hours.",
      '',
      'In the meantime, feel free to:',
      '- Follow me on Instagram @garcia.builder for daily tips',
      '- Check out transformation stories at garciabuilder.com',
      '- Book a free consultation call here: https://calendly.com/andrenjulio072/consultation',
      '',
      'Looking forward to speaking with you soon!',
      '',
      'Best regards,',
      'Andre Garcia',
      'Garcia Builder - Online Coaching',
      'Email: andre@garciabuilder.fitness',
      'Calendly: https://calendly.com/andrenjulio072/consultation',
      'Site: garciabuilder.com',
      '',
      "If you'd like to chat sooner, feel free to book a free consultation call using the link above."
    ];

    try {
      const confirmationData = new FormData();
      confirmationData.append('_to', userEmail);
      confirmationData.append('_subject', 'Message Received - Garcia Builder Coaching');
      confirmationData.append('_template', 'table');
      confirmationData.append('name', userName);
      confirmationData.append('message', lines.join('\n'));

      await fetch('https://formspree.io/f/mldpgrwq', {
        method: 'POST',
        body: confirmationData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (error) {
      console.warn('Failed to send confirmation email', error);
    }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();

    let hasError = false;
    setErr(nameEl, nameEl.value.trim().length < 2);
    hasError ||= nameEl.classList.contains('input-error');
    setErr(emailEl, !emailOk(emailEl.value));
    hasError ||= emailEl.classList.contains('input-error');
    setErr(goalEl, !goalEl.value);
    hasError ||= goalEl.classList.contains('input-error');
    setErr(timelineEl, !timelineEl.value);
    hasError ||= timelineEl.classList.contains('input-error');
    setErr(experienceEl, !experienceEl.value);
    hasError ||= experienceEl.classList.contains('input-error');
    setErr(messageEl, messageEl.value.trim().length < 10);
    hasError ||= messageEl.classList.contains('input-error');
    setErr(consentEl, !consentEl.checked);
    if (phoneEl) {
      setErr(phoneEl, !phoneOk(phoneEl.value));
      hasError ||= phoneEl.classList.contains('input-error');
    }

    if (hasError) {
      showMessage(getErrorMessage());
      return;
    }

    if (!canSubmit()) {
      showMessage('Message already sent. Please wait a minute before trying again.');
      return;
    }

    setButtonState(true);

    try {
      const targetUrl = form.getAttribute('action') || '/api/contact';
      const expectsJson = targetUrl.startsWith('/api/') || targetUrl.includes('/api/');
      let res;
      let responseData = {};

      if (expectsJson) {
        const payload = {
          name: nameEl.value.trim(),
          email: emailEl.value.trim(),
          phone: phoneEl ? phoneEl.value.trim() || null : null,
          preferred_contact: preferredContactEl ? preferredContactEl.value : null,
          primary_goal: goalEl.value || null,
          timeline: timelineEl.value || null,
          experience: experienceEl.value || null,
          budget: budgetEl ? budgetEl.value : null,
          message: messageEl.value.trim(),
          page_path: window.location.href,
          user_agent: navigator.userAgent
        };

        res = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const data = new FormData(form);
        res = await fetch(targetUrl, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
      }

      responseData = await res.json().catch(() => ({}));

      if (res.ok && (responseData.ok || !responseData.error)) {
        localStorage.setItem('gb_last_submit', Date.now().toString());

        const userEmail = emailEl.value.trim();
        const userName = nameEl.value.trim();

        form.reset();
        updateCount();
        showMessage('Thanks! Your message was sent. I will reply within 24-48h.');

        await sendConfirmationEmail(userName, userEmail);
      } else {
        const apiError = responseData.error || res.statusText || 'Unknown error';
        showMessage(`Hmm, something went wrong (${apiError}). You can also email me at: andre@garciabuilder.fitness`);
      }
    } catch (error) {
      console.warn('Contact form submission failed', error);
      showMessage('Network issue. If it persists, email me at: andre@garciabuilder.fitness');
    } finally {
      setButtonState(false);
    }
  });

  messageEl.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      form.requestSubmit();
    }
  });
})();
