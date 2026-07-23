// app.js (no topo, evite global poluído)
const onIdle = (fn) => ('requestIdleCallback' in window) ? requestIdleCallback(fn) : setTimeout(fn, 1);

document.addEventListener('DOMContentLoaded',()=>{
  const path = location.pathname.split('/').slice(-1)[0] || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{ if(a.getAttribute('href')===path){ a.classList.add('active'); } });
  if (window.VanillaTilt){
    document.querySelectorAll('.feature').forEach(el=>{
      VanillaTilt.init(el,{max:12,speed:300,glare:true,"max-glare":.18,reverse:true});
    });
  }
  const s=document.getElementById('faq-search');
  if(s){ s.addEventListener('input',e=>{
    const term=e.target.value.toLowerCase();
    document.querySelectorAll('#faqAccordion .accordion-item').forEach(it=>{ it.style.display=it.innerText.toLowerCase().includes(term)?'':'none'; });
  });}
  if (window.I18N){
    const lang = localStorage.getItem('lang') || 'en';
    const sel=document.getElementById('lang-select'); if(sel){sel.value=lang; sel.onchange=()=>{localStorage.setItem('lang', sel.value); location.reload();};}
    document.querySelectorAll('[data-i18n]').forEach(el=>{
       const key=el.getAttribute('data-i18n'); const str=I18N[lang]?.[key]; if(str){el.innerHTML=str;}
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
       const key=el.getAttribute('data-i18n-ph'); const str=I18N[lang]?.[key]; if(str){el.setAttribute('placeholder',str);}
    });
  }
});

// === Stage 10: hero parallax + count-up KPIs ===
const hero = document.querySelector('.hero');
if (hero){
  hero.addEventListener('mousemove',(e)=>{
    const r = hero.getBoundingClientRect();
    const mx = (e.clientX - r.left)/r.width - .5;
    const my = (e.clientY - r.top)/r.height - .5;
    hero.style.setProperty('--mx', mx.toFixed(3));
    hero.style.setProperty('--my', my.toFixed(3));
  });
}
// count-up when visible, with a fallback for browsers without a complete observer implementation
const animateKpis = (root) => {
  root.querySelectorAll('.num[data-target]').forEach(el=>{
        const target = +el.dataset.target;
        const start = 0; const dur = 1200; const t0 = performance.now();
        const step = (t)=>{
          const k = Math.min(1,(t - t0)/dur);
          const v = Math.floor(start + (target - start)*k);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          el.textContent = `${prefix}${v}${suffix}`;
          if(k<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        el.removeAttribute('data-target');
  });
};

if (typeof window.IntersectionObserver === 'function') {
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        animateKpis(en.target);
        io.unobserve(en.target);
      }
    });
  }, {threshold:.6});
  document.querySelectorAll('.kpis').forEach(k=>io.observe(k));
} else {
  document.querySelectorAll('.kpis').forEach(animateKpis);
}

(function(){
  const isSmall = window.matchMedia('(max-width: 767.98px)').matches;

  // 1) VanillaTilt: remove em telas pequenas
  if (isSmall && window.VanillaTilt) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      try { el.vanillaTilt?.destroy(); } catch(e){}
      el.classList.add('no-tilt');
      el.removeAttribute('data-tilt');
    });
  }

  // 2) Evitar 300ms delay em iOS antigos (opcional leve)
  document.addEventListener('touchstart', ()=>{}, {passive:true});
})();

// 3D tilt: só desktop (hover) e quando ocioso
onIdle(() => {
  if (window.matchMedia('(hover: hover)').matches && window.VanillaTilt) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      window.VanillaTilt.init(el, { glare: true, 'max-glare': .15, speed: 400, scale: 1.02 });
    });
  }
});

// Reveal the homepage pathway cards as they enter the viewport.
(() => {
  const section = document.querySelector('.homepage-seo-pathways');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('.homepage-pathway-card'));
  cards.forEach((card, index) => {
    card.style.setProperty('--pathway-delay', `${index * 75}ms`);
  });

  const revealCards = () => cards.forEach(card => card.classList.add('is-visible'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || typeof window.IntersectionObserver !== 'function') {
    revealCards();
    return;
  }

  section.classList.add('pathway-animations-ready');
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    revealCards();
    observer.disconnect();
  }, { threshold: 0.16, rootMargin: '0px 0px -40px' });

  observer.observe(section);
})();

// FAQ search: debouce (evita rodar a cada tecla)
const $q = document.querySelector('#faq-search');
if ($q) {
  let t;
  $q.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(runFaqFilter, 150); // 150ms é suave
  });
}

