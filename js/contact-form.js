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
  const charCount = document.getElementById('charCount');

  // Check if required elements exist
  if (!btn || !alertBox || !nameEl || !emailEl || !goalEl ||
      !timelineEl || !experienceEl || !messageEl || !consentEl) {
    console.warn('Contact form: Some required elements are missing');
    return;
  }

  // Character counter
  const updateCount = () => {
    if (charCount) {
      charCount.textContent = `${messageEl.value.length}/1200`;
    }
  };
  messageEl.addEventListener('input', updateCount);
  updateCount();

  // Helpers
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const phoneOk = v => !v || /^[\+]?[0-9\s\-\(\)]{6,24}$/.test(v.trim());
  const setErr = (el, on) => el.classList.toggle('input-error', !!on);

  // Generate specific error message
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

  // Simple submit rate-limit: 1 per 60s
  const canSubmit = () => {
    const last = Number(localStorage.getItem('gb_last_submit')||0);
    return Date.now() - last > 60_000;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate required fields
    let bad = false;
    setErr(nameEl, nameEl.value.trim().length < 2);       bad ||= nameEl.classList.contains('input-error');
    setErr(emailEl, !emailOk(emailEl.value));              bad ||= emailEl.classList.contains('input-error');
    setErr(goalEl, !goalEl.value);                         bad ||= goalEl.classList.contains('input-error');
    setErr(timelineEl, !timelineEl.value);                 bad ||= timelineEl.classList.contains('input-error');
    setErr(experienceEl, !experienceEl.value);             bad ||= experienceEl.classList.contains('input-error');
    setErr(messageEl, messageEl.value.trim().length < 10); bad ||= messageEl.classList.contains('input-error');
    setErr(consentEl, !consentEl.checked);                 // visual hint via CSS not needed here

    // Optional field validation
    setErr(phoneEl, !phoneOk(phoneEl.value));              bad ||= phoneEl.classList.contains('input-error');

    if (bad) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = getErrorMessage();
      return;
    }

    if (!canSubmit()) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Message already sent. Please wait a minute before trying again.';
      return;
    }

    // Send
    btn.disabled = true;
    btn.classList.add('is-loading');
    if (btn.firstChild && btn.dataset.loading) {
      btn.firstChild.nodeValue = btn.dataset.loading;
    }

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        localStorage.setItem('gb_last_submit', Date.now().toString());
        form.reset(); updateCount();
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = 'Thanks! Your message was sent. I’ll reply within 24–48h.';
      } else {
        alertBox.classList.remove('visually-hidden');
        alertBox.textContent = 'Hmm, something went wrong. You can also email me at: coach@garciabuilder.com';
      }
    } catch {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Network issue. If it persists, email me at: coach@garciabuilder.com';
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.firstChild && btn.dataset.default) {
        btn.firstChild.nodeValue = btn.dataset.default;
      }
    }
  });

  // Ctrl/Cmd + Enter to submit from textarea
  messageEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') form.requestSubmit();
  });
})();
