
// i18n minimal (kept previous strings)
document.addEventListener('DOMContentLoaded',()=>{
  const lang=localStorage.getItem('lang')||'en';
  document.documentElement.lang=lang;
  const sel=document.getElementById('lang-select'); if(sel){sel.value=lang; sel.onchange=()=>{localStorage.setItem('lang', sel.value); location.reload();};}
  // Active nav
  const path = location.pathname.split('/').slice(-1)[0] || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{ if(a.getAttribute('href')===path){ a.classList.add('active'); a.style.color='#ffe9a8'; a.style.fontWeight='800'; } });
  // FAQ search
  const s=document.getElementById('faq-search');
  if(s){ s.addEventListener('input',e=>{
    const term=e.target.value.toLowerCase();
    document.querySelectorAll('#faqAccordion .accordion-item').forEach(it=>{ it.style.display=it.innerText.toLowerCase().includes(term)?'':'none'; });
  });}
});
