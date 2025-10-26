// Função utilitária para uso no frontend do formulário de contato
// assets/js/contact-send.js

async function enviarContato(form) {
  const data = Object.fromEntries(new FormData(form));
  const payload = {
    name: data.name || data.nome || null,
    email: data.email || data.mail || null,
    phone: data.phone || data.telefone || null,
    preferred_contact: data.preferred_contact || data.preferredContact || data.contact_preference || null,
    primary_goal: data.primary_goal || data.goal || data.objetivo || null,
    timeline: data.timeline || data.timeframe || null,
    experience: data.experience || data.nivel || null,
    budget: data.budget || data.orcamento || null,
    message: data.message || data.mensagem || '',
    page_path: window.location.href,
    user_agent: navigator.userAgent
  };
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && (json?.ok || !json?.error)) {
      form.reset();
      // Hide the form and show the success message
      form.style.display = 'none';
      let msgDiv = document.getElementById('contact-success-msg');
      if (!msgDiv) {
        msgDiv = document.createElement('div');
        msgDiv.id = 'contact-success-msg';
        msgDiv.style.margin = '2em auto';
        msgDiv.style.maxWidth = '500px';
        msgDiv.style.background = 'rgba(30,40,60,0.95)';
        msgDiv.style.color = '#fff';
        msgDiv.style.borderRadius = '12px';
        msgDiv.style.padding = '2em 1.5em';
        msgDiv.style.fontSize = '1.2em';
        msgDiv.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
        form.parentNode.insertBefore(msgDiv, form);
      }
      msgDiv.innerHTML = `
        <strong>Thank you for getting in touch!</strong><br>
        Your message has been received successfully.<br><br>
        I appreciate your interest and will review your information carefully.<br>
        You will receive a confirmation email shortly. I will respond as soon as possible to discuss your goals and next steps.<br><br>
        <span style='font-size:0.95em;opacity:0.8;'>If you do not see the confirmation email, please check your spam or junk folder.</span>
      `;
      msgDiv.classList.remove('hidden');
    } else {
      alert('Error: ' + (json?.error || res.statusText || 'Failed to send.'));
    }
  } catch (e) {
    alert('Error sending message.');
  }
  btn.disabled = false;
}
// Usage: <form onsubmit="enviarContato(this); return false;"> ... </form>
// The message will appear in place of the form.
