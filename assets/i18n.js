
(function(){
  const FALLBACK_LANG = 'en';
  const SUPPORTED = ['en','pt','es'];
  const LS_KEY = 'gb_lang';
  const cache = {};

  function getLang(){
    const q = new URLSearchParams(location.search).get('lang');
    if(q && SUPPORTED.includes(q)) return q;
    const ls = localStorage.getItem(LS_KEY);
    if(ls && SUPPORTED.includes(ls)) return ls;
    const nav = (navigator.language || 'en').slice(0,2);
    return SUPPORTED.includes(nav) ? nav : FALLBACK_LANG;
  }

  async function loadDict(lang){
    if(cache[lang]) return cache[lang];
    try{
      const res = await fetch(`assets/locales/${lang}.json`, {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json = await res.json();
      cache[lang] = json;
      return json;
    }catch(e){
      console.warn('[i18n] load failed for', lang, e);
      if(lang !== FALLBACK_LANG) return loadDict(FALLBACK_LANG);
      return {};
    }
  }

  function get(obj, path){
    return path.split('.').reduce((o, k)=> (o && k in o) ? o[k] : null, obj);
  }

  function apply(dict){
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = get(dict, key);
      if(typeof val === 'string') el.textContent = val;
      else if(val != null) el.textContent = String(val);
      else console.warn('[i18n] missing key', key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = get(dict, key);
      if(typeof val === 'string') el.setAttribute('placeholder', val);
    });
  }

  async function init(){
    const lang = getLang();
    localStorage.setItem(LS_KEY, lang);
    const dict = await loadDict(lang);
    apply(dict);
    const mo = new MutationObserver(()=>apply(dict));
    mo.observe(document.body, {childList:true, subtree:true});
    window.__i18n = {
      get: ()=> lang,
      set: async (next)=>{
        if(!SUPPORTED.includes(next)) return;
        localStorage.setItem(LS_KEY, next);
        const nd = await loadDict(next);
        apply(nd);
      }
    };
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
