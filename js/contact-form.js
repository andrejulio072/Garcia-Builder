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

  if (!btn || !alertBox || !nameEl || !emailEl || !goalEl ||
      !timelineEl || !experienceEl || !messageEl || !consentEl) {
    console.warn('Contact form: Some required elements are missing');
    return;
  }

  const updateCount = () => {
    if (charCount) charCount.textContent = `${messageEl.value.length}/1200`;
  };
  messageEl.addEventListener('input', updateCount);
  updateCount();

  const emailOk = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const phoneOk = value => !value || /^[+]?[0-9\s\-()]{6,24}$/.test(value.trim());
  const setErr = (element, on) => element?.classList.toggle('input-error', Boolean(on));

  const getErrorMessage = () => {
    const fields = [
      [nameEl, 'name'], [emailEl, 'email'], [phoneEl, 'phone number'],
      [goalEl, 'primary goal'], [timelineEl, 'timeline'],
      [experienceEl, 'training experience'], [messageEl, 'message'],
      [consentEl, 'consent agreement']
    ];
    const errors = fields
      .filter(([element]) => element?.classList.contains('input-error'))
      .map(([, label]) => label);
    return errors.length ? `Please check: ${errors.join(', ')}` : 'Please check the highlighted fields.';
  };

  const canSubmit = () => {
    const last = Number(localStorage.getItem('gb_last_submit') || 0);
    return Date.now() - last > 60_000;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();

    setErr(nameEl, nameEl.value.trim().length < 2);
    setErr(emailEl, !emailOk(emailEl.value));
    setErr(phoneEl, phoneEl ? !phoneOk(phoneEl.value) : false);
    setErr(goalEl, !goalEl.value);
    setErr(timelineEl, !timelineEl.value);
    setErr(experienceEl, !experienceEl.value);
    setErr(messageEl, messageEl.value.trim().length < 10);
    setErr(consentEl, !consentEl.checked);

    const invalid = [nameEl, emailEl, phoneEl, goalEl, timelineEl, experienceEl, messageEl, consentEl]
      .some(element => element?.classList.contains('input-error'));
    if (invalid) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = getErrorMessage();
      return;
    }

    if (!canSubmit()) {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Message already sent. Please wait a minute before trying again.';
      return;
    }

    btn.disabled = true;
    btn.classList.add('is-loading');
    if (btn.firstChild && btn.dataset.loading) btn.firstChild.nodeValue = btn.dataset.loading;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      alertBox.classList.remove('visually-hidden');
      if (response.ok) {
        localStorage.setItem('gb_last_submit', Date.now().toString());
        form.reset();
        updateCount();
        alertBox.textContent = 'Thanks! Your message was sent. I’ll reply within 24–48h.';
      } else {
        alertBox.textContent = 'Hmm, something went wrong. You can also email me at: coach@garciabuilder.com';
      }
    } catch {
      alertBox.classList.remove('visually-hidden');
      alertBox.textContent = 'Network issue. If it persists, email me at: coach@garciabuilder.com';
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.firstChild && btn.dataset.default) btn.firstChild.nodeValue = btn.dataset.default;
    }
  });

  messageEl.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') form.requestSubmit();
  });
})();
