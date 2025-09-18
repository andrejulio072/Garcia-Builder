
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
// count-up when visible
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      en.target.querySelectorAll('.num[data-target]').forEach(el=>{
        const target = +el.dataset.target;
        const start = 0; const dur = 1200; const t0 = performance.now();
        const step = (t)=>{
          const k = Math.min(1,(t - t0)/dur);
          const v = Math.floor(start + (target - start)*k);
          el.textContent = el.dataset.prefix ? el.dataset.prefix + v : v;
          if(k<1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        el.removeAttribute('data-target');
      });
      io.unobserve(en.target);
    }
  });
}, {threshold:.6});
document.querySelectorAll('.kpis').forEach(k=>io.observe(k));
