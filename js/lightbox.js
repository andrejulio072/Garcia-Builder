// Lightbox reutilizável para galerias
function initLightbox() {
  // Verificar se já existe um lightbox
  if (document.getElementById('garcia-lightbox')) return;

  const lb = document.createElement('div');
  lb.id = 'garcia-lightbox';
  lb.style.cssText = 'position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.85);z-index:1000';
  lb.innerHTML = '<img loading="lazy" decoding="async" style="max-width:92vw;max-height:92vh;border-radius:12px"><div style="position:absolute;top:20px;right:30px;font-size:26px;cursor:pointer;color:white">✕</div>';
  document.body.appendChild(lb);

  const img = lb.querySelector('img');
  const close = lb.querySelector('div');

  // Fechar lightbox ao clicar no overlay ou botão X
  lb.addEventListener('click', () => lb.style.display = 'none');
  close.addEventListener('click', () => lb.style.display = 'none');

  // Adicionar eventos aos links da galeria
  document.querySelectorAll('.gallery a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      img.src = a.getAttribute('href');
      lb.style.display = 'grid';
    });
  });
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLightbox);
} else {
  initLightbox();
}
