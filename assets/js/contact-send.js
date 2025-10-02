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
      document.getElementById('contact-success-msg')?.classList.remove('hidden');
      // Se não houver div de sucesso, mostra alert
      if (!document.getElementById('contact-success-msg')) {
        alert('Mensagem enviada com sucesso! Você receberá um e-mail de confirmação.');
      }
    } else {
      const err = await res.json();
      alert('Erro: ' + (err.error || 'Falha ao enviar.'));
    }
  } catch (e) {
    alert('Erro ao enviar.');
  }
  btn.disabled = false;
}
// Para usar: <form onsubmit="enviarContato(this); return false;"> ... </form>
// Inclua uma div <div id="contact-success-msg" class="hidden">Mensagem enviada com sucesso!</div> para feedback visual.
