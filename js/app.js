
document.addEventListener('DOMContentLoaded',()=>{
  const lang=localStorage.getItem('lang')||'en';
  const dict=(window.I18N||{})[lang]||(window.I18N||{})['en']||{};
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n'); if(dict[k]) el.innerHTML=dict[k];});
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{const k=el.getAttribute('data-i18n-ph'); if(dict[k]) el.setAttribute('placeholder',dict[k]);});
  const sel=document.getElementById('lang-select'); if(sel){sel.value=lang; sel.onchange=()=>{localStorage.setItem('lang', sel.value); location.reload();};}
  const s=document.getElementById('faq-search'); if(s){s.addEventListener('input',e=>{const t=e.target.value.toLowerCase(); document.querySelectorAll('#faqAccordion .accordion-item').forEach(i=>{i.style.display=(i.innerText.toLowerCase().includes(t))?'':'none';});});}
});
