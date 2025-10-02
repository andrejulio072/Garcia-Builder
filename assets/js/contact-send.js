// Função utilitária para uso no frontend do formulário de contato
// assets/js/contact-send.js

async function enviarContato(form) {
  const data = Object.fromEntries(new FormData(form));
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await fetch('/api/contact-confirmation.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
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
      const err = await res.json();
      alert('Error: ' + (err.error || 'Failed to send.'));
    }
  } catch (e) {
    alert('Error sending message.');
  }
  btn.disabled = false;
}
// Usage: <form onsubmit="enviarContato(this); return false;"> ... </form>
// The message will appear in place of the form.
