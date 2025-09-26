// Pricing page specific JavaScript
(function() {
  /* Tilt effect for pricing cards */
  if (window.VanillaTilt) {
    document.querySelectorAll('.price').forEach(el => {
      VanillaTilt.init(el, { max: 6, speed: 500, glare: false });
    });
  }

  /* Scroll reveal animation */
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .15 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
