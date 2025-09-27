// Pricing page specific JavaScript
(function() {
  function renderPricing(){
    const container = document.getElementById('pricingGrid');
    if (!container) return;

    const lang = (window.GB_I18N && window.GB_I18N.getLang && window.GB_I18N.getLang()) || 'en';
    const dict = (window.DICTS && window.DICTS[lang] && window.DICTS[lang].pricing) ? window.DICTS[lang].pricing : null;
    if (!dict) { setTimeout(renderPricing, 50); return; }

    const plans = dict.plans;
    const order = ['starter','beginner','essentials','full','elite'];
    container.innerHTML = order.map(key => {
      const p = plans[key]; if (!p) return '';
      const features = (p.features||[]).map(f=>`<li>${f}</li>`).join('');
      return `
        <div class="price reveal" data-tilt data-tilt-max="6" data-tilt-speed="500">
          ${p.badge ? `<span class=\"save\">${p.badge}</span>` : ''}
          <h3>${p.name}</h3>
          <div class="tag">${p.price}<span style="font-size:16px">${p.period}</span></div>
          <ul>${features}</ul>
          <p class="muted">${p.description || ''}</p>
          <a class="btn btn-gold" href="contact.html">${dict.cta?.choose || 'Choose Plan'}</a>
        </div>`;
    }).join('');

    // Initialize tilt
    if (window.VanillaTilt) {
      container.querySelectorAll('.price').forEach(el => {
        VanillaTilt.init(el, { max: 6, speed: 500, glare: false });
      });
    }

    // Reveal animation
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    container.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  window.addEventListener('load', () => setTimeout(renderPricing, 100));
  document.addEventListener('languageChanged', renderPricing);
})();
