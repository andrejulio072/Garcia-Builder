
// Inject credibility cards below KPIs without touching your existing HTML.
(function(){
  function ensureCSS(){
    if(!document.querySelector('link[href*="credibility.css"]')){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/credibility.css';
      document.head.appendChild(link);
    }
  }

  function findTransObject(){
    // Try to detect the i18n object commonly used (en/pt/es keys)
    const candidates = Object.entries(window).filter(([k,v])=>{
      if(!v || typeof v!=='object') return false;
      const keys = Object.keys(v||{});
      return keys.includes('en') && keys.includes('pt') && keys.includes('es');
    });
    // Pick the first object that has string values for some keys
    for(const [k,obj] of candidates){
      if(typeof obj.en==='object' && typeof obj.pt==='object' && typeof obj.es==='object'){
        return obj;
      }
    }
    // fallback: create one if not present
    window.I18N = window.I18N || {en:{},pt:{},es:{}};
    return window.I18N;
  }

  const credKeys = {
    en: {
      "cred.c1.t":"Active IQ Level 2 & 3 (UK)",
      "cred.c1.p":"Evidence-based programming, hypertrophy and S&C foundations.",
      "cred.c2.t":"Under 24h response",
      "cred.c2.p":"Weekly reviews + in-app messaging support to keep you moving.",
      "cred.c3.t":"Clients in 5+ countries",
      "cred.c3.p":"Brazil, Spain, UK, USA and India."
    },
    pt: {
      "cred.c1.t":"Active IQ Nível 2 & 3 (UK)",
      "cred.c1.p":"Treino baseado em evidências, hipertrofia e fundamentos de S&C.",
      "cred.c2.t":"Resposta em até 24h",
      "cred.c2.p":"Revisões semanais + suporte no chat do app para manter o ritmo.",
      "cred.c3.t":"Clientes em 5+ países",
      "cred.c3.p":"Brasil, Espanha, Reino Unido, EUA e Índia."
    },
    es: {
      "cred.c1.t":"Active IQ Nivel 2 & 3 (UK)",
      "cred.c1.p":"Entrenamiento basado en evidencia, hipertrofia y fundamentos de S&C.",
      "cred.c2.t":"Respuesta en menos de 24h",
      "cred.c2.p":"Revisiones semanales + soporte por el chat de la app para mantener el avance.",
      "cred.c3.t":"Clientes en 5+ países",
      "cred.c3.p":"Brasil, España, Reino Unido, EE.UU. e India."
    }
  };

  function extendI18N(){
    const i18n = findTransObject();
    ['en','pt','es'].forEach(lang=>{
      i18n[lang] = i18n[lang] || {};
      Object.assign(i18n[lang], credKeys[lang]);
    });
  }

  function injectHTML(){
    const kpis = document.querySelector('.hero .kpis');
    if(!kpis) return;
    if(document.getElementById('credibility')) return; // avoid duplicates
    const wrap = document.createElement('div');
    wrap.className = 'grid-3 mt-3';
    wrap.id = 'credibility';
    wrap.innerHTML = [
      '<div class="card credcard"><div class="ic" aria-hidden="true">🎓</div><h4 class="mb-1" data-i18n="cred.c1.t">Active IQ Level 2 & 3 (UK)</h4><p data-i18n="cred.c1.p">Evidence-based programming, hypertrophy and S&C foundations.</p></div>',
      '<div class="card credcard"><div class="ic" aria-hidden="true">⚡</div><h4 class="mb-1" data-i18n="cred.c2.t">Under 24h response</h4><p data-i18n="cred.c2.p">Weekly reviews + in-app messaging support to keep you moving.</p></div>',
      '<div class="card credcard"><div class="ic" aria-hidden="true">🌍</div><h4 class="mb-1" data-i18n="cred.c3.t">Clients in 5+ countries</h4><p data-i18n="cred.c3.p">Brazil, Spain, UK, USA and India.</p></div>'
    ].join('');
    // Insert after the KPIs block
    kpis.parentNode.insertBefore(wrap, kpis.nextSibling);
  }

  function retranslate(){
    // If your site already has a function to refresh i18n, call it here.
    // Try common patterns:
    const fns = ['applyTranslations','refreshI18n','i18nApply','translatePage'];
    for(const name of fns){
      if(typeof window[name]==='function'){ window[name](); return; }
    }
    // fallback: naive apply for our three cards only
    const i18n = findTransObject();
    const current = (document.documentElement.getAttribute('lang')||'en').toLowerCase();
    const dict = i18n[current] || {};
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
  }

  function init(){
    ensureCSS();
    extendI18N();
    injectHTML();
    retranslate();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
