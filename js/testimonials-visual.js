// Visual enhancements: staggered reveal + tilt for testimonial cards
(() => {
  const init = () => {
    const cards = document.querySelectorAll('.grid .tcard');
    if (!cards.length) return;

    // Initialize tilt
    if (window.VanillaTilt) {
      cards.forEach((el) => {
        VanillaTilt.init(el, { max: 6, speed: 500, glare: false });
      });
    }

    // Reveal on scroll with stagger
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card, idx) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(12px)';
      card.style.transition = 'opacity .5s ease, transform .5s ease';
      card.style.transitionDelay = `${(idx % 6) * 60}ms`;
      io.observe(card);

      card.addEventListener('mouseenter', () => card.classList.add('hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
