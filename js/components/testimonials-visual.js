// Visual enhancements: staggered reveal + premium pointer depth.
(() => {
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

    if (typeof window.IntersectionObserver !== 'function') {
      cards.forEach((card, idx) => {
        card.style.setProperty('--reveal-delay', `${(idx % 8) * 55}ms`);
        card.classList.add('is-visible');
        applyPointerDepth(card);
      });
      document.querySelectorAll('.spotlight-card').forEach((card) => card.classList.add('is-visible'));

      const spotlightRoot = document.getElementById('testimonial-spotlight');
      if (spotlightRoot && typeof window.MutationObserver === 'function') {
        const observer = new MutationObserver(() => {
          spotlightRoot.querySelectorAll('.spotlight-card').forEach((card) => card.classList.add('is-visible'));
        });
        observer.observe(spotlightRoot, { childList: true });
      }
      return;
    }

    document.documentElement.classList.add('testimonials-reveal');
    window.setTimeout(() => {
      if (!document.querySelector('.tcard.is-visible, .spotlight-card.is-visible')) {
        document.documentElement.classList.remove('testimonials-reveal');
        document.querySelectorAll('.tcard, .spotlight-card').forEach((card) => card.classList.add('is-visible'));
      }
    }, 1200);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.14 });

    const observeRevealTarget = (target) => {
      if (reducedMotion) {
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
    if (spotlightRoot && typeof window.MutationObserver === 'function') {
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
