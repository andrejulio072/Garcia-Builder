/* Lightweight lightbox for gallery, featured, and process images */
(function () {
  if (typeof window === 'undefined') return;

  const body = document.body;

  const buildOverlay = (src, altText) => {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-backdrop';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('aria-label', 'Close preview');
    closeBtn.innerHTML = '&times;';

    const image = document.createElement('img');
    image.className = 'lightbox-image';
    image.src = src;
    image.alt = altText || '';

    overlay.appendChild(closeBtn);
    overlay.appendChild(image);
    return { overlay, closeBtn, image };
  };

  const openLightbox = (src, altText) => {
    const { overlay, closeBtn } = buildOverlay(src, altText);
    body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
      closeBtn.focus({ preventScroll: true });
    });

    const teardown = () => {
      overlay.classList.remove('is-visible');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      document.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        teardown();
      }
    };

    closeBtn.addEventListener('click', teardown);
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) {
        teardown();
      }
    });

    document.addEventListener('keydown', onKeyDown);
  };

  const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const src = trigger.getAttribute('data-lightbox') || trigger.getAttribute('src');
    if (!src) return;

    const altText = trigger.getAttribute('alt') || trigger.getAttribute('aria-label') || '';

    const handleOpen = (evt) => {
      evt.preventDefault();
      openLightbox(src, altText);
    };

    trigger.addEventListener('click', handleOpen);

    trigger.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        handleOpen(evt);
      }
    });

    if (!trigger.hasAttribute('tabindex')) {
      trigger.setAttribute('tabindex', '0');
    }

    if (!trigger.hasAttribute('role')) {
      trigger.setAttribute('role', 'button');
    }

    trigger.classList.add('lightbox-trigger');
  });
})();
