// Lightbox reutilizável para galerias
function initLightbox() {
  // Verificar se já existe um lightbox
  if (document.getElementById('garcia-lightbox')) return;

  const lb = document.createElement('div');
  lb.id = 'garcia-lightbox';
  lb.style.cssText = 'position:fixed;inset:0;display:none;place-items:center;background:rgba(0,0,0,.85);z-index:1000';
  lb.innerHTML = '<div class="lb-viewport" style="position:relative;max-width:92vw;max-height:92vh;overflow:hidden;border-radius:12px"><img loading="lazy" decoding="async" style="transform:translate(0px,0px) scale(1);cursor:grab;transform-origin:center center;user-select:none;-webkit-user-drag:none"></div><div style="position:absolute;top:20px;right:30px;font-size:26px;cursor:pointer;color:white">✕</div>';
  document.body.appendChild(lb);

  const viewport = lb.querySelector('.lb-viewport');
  const img = lb.querySelector('img');
  const close = lb.querySelector('div');

  // Fechar lightbox ao clicar no overlay ou botão X
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target === close) lb.style.display = 'none'; });
  close.addEventListener('click', () => lb.style.display = 'none');

  // Pan & Zoom state
  let scale = 1, tx = 0, ty = 0, isPanning = false, startX = 0, startY = 0;
  const apply = () => { img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`; };
  const clamp = () => {
    const rect = viewport.getBoundingClientRect();
    const iw = img.naturalWidth * scale;
    const ih = img.naturalHeight * scale;
    const maxX = Math.max(0, (iw - rect.width)/2);
    const maxY = Math.max(0, (ih - rect.height)/2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  };
  const resetView = () => { scale = 1; tx = 0; ty = 0; apply(); };

  // Mouse wheel zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.1;
    const prev = scale;
    scale = Math.min(4, Math.max(1, scale + delta));
    if (scale !== prev) {
      // Zoom to cursor
      const rect = viewport.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width/2;
      const cy = e.clientY - rect.top - rect.height/2;
      tx = tx - (cx * (scale - prev));
      ty = ty - (cy * (scale - prev));
      clamp();
      apply();
    }
  }, { passive: false });

  // Drag to pan
  const onDown = (e) => { isPanning = true; img.style.cursor = 'grabbing'; startX = e.clientX; startY = e.clientY; };
  const onMove = (e) => { if (!isPanning) return; tx += (e.clientX - startX); ty += (e.clientY - startY); startX = e.clientX; startY = e.clientY; clamp(); apply(); };
  const onUp = () => { isPanning = false; img.style.cursor = 'grab'; };
  img.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);

  // Touch support
  let touch0 = null, touch1 = null, startDist = 0, startScale = 1, startTx = 0, startTy = 0;
  const getDist = (t0, t1) => Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) { touch0 = e.touches[0]; isPanning = true; startX = touch0.clientX; startY = touch0.clientY; }
    if (e.touches.length === 2) { touch0 = e.touches[0]; touch1 = e.touches[1]; startDist = getDist(touch0, touch1); startScale = scale; startTx = tx; startTy = ty; }
  }, { passive: false });
  viewport.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isPanning) {
      const t = e.touches[0]; tx += (t.clientX - startX); ty += (t.clientY - startY); startX = t.clientX; startY = t.clientY; clamp(); apply();
    }
    if (e.touches.length === 2) {
      const t0 = e.touches[0], t1 = e.touches[1]; const d = getDist(t0, t1); const prev = scale; scale = Math.min(4, Math.max(1, startScale * (d / startDist))); if (scale !== prev) { clamp(); apply(); }
    }
  }, { passive: false });
  viewport.addEventListener('touchend', () => { isPanning = false; });

  // Double click/tap to reset
  viewport.addEventListener('dblclick', resetView);

  // Adicionar eventos aos links da galeria
  document.querySelectorAll('.gallery a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      img.onload = () => { resetView(); };
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
