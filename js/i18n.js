
(function(){
  const SUPPORTED = ['en','pt','es'];
  function getLang(){
    const url = new URL(window.location.href);
    const q = url.searchParams.get('lang');
    if(q && SUPPORTED.includes(q)) { localStorage.setItem('lang', q); return q; }
    const saved = localStorage.getItem('lang');
    if(saved && SUPPORTED.includes(saved)) return saved;
    const nav = (navigator.language||'en').slice(0,2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : 'en';
  }
  const lang = getLang();
  const link = document.querySelector('link[rel=\"alternate\"]#dynamic-lang');
  if(link) link.href = `?lang=${lang}`;
  fetch(`locales/${lang}.json`).then(r=>r.json()).then(dict=>{
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const key = el.getAttribute('data-i18n-placeholder');
      if(dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    document.documentElement.setAttribute('lang', lang);
    const sel = document.getElementById('lang-select');
    if(sel){ sel.value = lang; sel.addEventListener('change', e=>{
      const v = e.target.value; localStorage.setItem('lang', v);
      const url = new URL(window.location.href); url.searchParams.set('lang', v); window.location.href = url.toString();
    });}
  });
})();
