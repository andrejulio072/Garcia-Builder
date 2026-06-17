// Visual enhancements: staggered reveal + premium pointer depth.
(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const applyPointerDepth = (card) => {
    if (reducedMotion) return;

    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const tiltY = (x - 0.5) * 7;
      const tiltX = (0.5 - y) * 7;

      card.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      card.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--shine-x', '50%');
      card.style.setProperty('--shine-y', '0%');
    });
  };

  const init = () => {
    const cards = document.querySelectorAll('.grid .tcard');
    const canObserve = 'IntersectionObserver' in window;

    const io = canObserve ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.14 }) : null;

    const observeRevealTarget = (target) => {
      if (reducedMotion || !io) {
        target.classList.add('is-visible');
        return;
      }
      io.observe(target);
    };

    cards.forEach((card, idx) => {
      card.style.setProperty('--reveal-delay', `${(idx % 8) * 55}ms`);
      applyPointerDepth(card);
      observeRevealTarget(card);
    });

    document.querySelectorAll('.spotlight-card').forEach(observeRevealTarget);

    const spotlightRoot = document.getElementById('testimonial-spotlight');
    if (spotlightRoot) {
      const observer = new MutationObserver(() => {
        spotlightRoot.querySelectorAll('.spotlight-card').forEach(observeRevealTarget);
      });
      observer.observe(spotlightRoot, { childList: true });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
