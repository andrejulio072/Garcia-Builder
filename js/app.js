
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
