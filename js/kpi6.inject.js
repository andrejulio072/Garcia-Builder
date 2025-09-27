
// Rebuild KPIs into a 6-card uniform grid with i18n.
(function(){
  function ensureCSS(){
    if(!document.querySelector('link[href*="kpi6.css"]')){
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'css/kpi6.css';
      document.head.appendChild(link);
    }
  }

  function i18nObj(){
    // Try to detect global dictionary (en/pt/es)
    const cands = Object.entries(window).filter(([k,v])=>v && typeof v==='object' && v.en && v.pt && v.es);
    for(const [,obj] of cands){
      if(typeof obj.en==='object') return obj;
    }
    // fallback
    window.I18N = window.I18N || {en:{},pt:{},es:{}};
    return window.I18N;
  }

  const addKeys = {
    en:{
      "kpi.transforms":"Transformations",
      "kpi.years":"Years Coaching",
      "kpi.langs":"Languages",
      "kpi.worldwide":"Worldwide Clients",
      "kpi.response":"Response Time",
      "kpi.support":"7‑day Support"
    },
    pt:{
      "kpi.transforms":"Transformações",
      "kpi.years":"Anos como Coach",
      "kpi.langs":"Idiomas",
      "kpi.worldwide":"Clientes no mundo todo",
      "kpi.response":"Tempo de resposta",
      "kpi.support":"Suporte 7 dias"
    },
    es:{
      "kpi.transforms":"Transformaciones",
      "kpi.years":"Años de Coaching",
      "kpi.langs":"Idiomas",
      "kpi.worldwide":"Clientes en todo el mundo",
      "kpi.response":"Tiempo de respuesta",
      "kpi.support":"Soporte 7 días"
    }
  };

  function extendI18N(){
    const dict = i18nObj();
    ['en','pt','es'].forEach(l=>Object.assign(dict[l], addKeys[l]));
  }

  function buildKPI(num, labelKey, staticText, opts){
    const div = document.createElement('div');
    div.className = 'kpi';
    const numEl = document.createElement('span');
    numEl.className = 'num';
    const o = opts||{};
    if(typeof num==='number'){
      numEl.textContent = o.prefix? `${o.prefix}0`: '0';
      numEl.dataset.target = String(num);
      if(o.prefix) numEl.dataset.prefix = o.prefix;
      if(o.suffix) numEl.dataset.suffix = o.suffix;
    } else if (typeof num==='string' && /^\d+\+?$/.test(num)){
      // strings tipo '100+'
      const clean = parseInt(num,10);
      numEl.textContent = '0';
      numEl.dataset.target = String(clean);
      if(num.endsWith('+')) numEl.dataset.suffix = '+';
    } else if (typeof num==='string' && /^(\d+)h$/.test(num)){
      // '24h' -> count 0..24 e sufixo h
      const m = num.match(/^(\d+)h$/);
      numEl.textContent = '0h';
      numEl.dataset.target = m[1];
      numEl.dataset.suffix = 'h';
    } else if (typeof num==='string' && /^(\d+)d$/.test(num)){
      // '7d' -> count 0..7 e sufixo d
      const m = num.match(/^(\d+)d$/);
      numEl.textContent = '0d';
      numEl.dataset.target = m[1];
      numEl.dataset.suffix = 'd';
    } else {
      numEl.textContent = num;
    }
    const labelEl = document.createElement('span');
    labelEl.className = 'label';
    if(labelKey){
      labelEl.setAttribute('data-i18n', labelKey);
      labelEl.textContent = staticText || labelKey;
    } else {
      labelEl.textContent = staticText || '';
    }
    div.appendChild(numEl);
    div.appendChild(labelEl);
    return div;
  }

  function rebuild(){
    const wrap = document.querySelector('.hero .kpis, .kpis');
    if(!wrap) return;
    // Clear old children
    wrap.innerHTML = '';
    // Six KPIs
  wrap.appendChild(buildKPI('100+', 'kpi.transforms', 'Transformations'));
  wrap.appendChild(buildKPI(12, 'kpi.years', 'Years Coaching'));
  wrap.appendChild(buildKPI(3, 'kpi.langs', 'Languages'));
  wrap.appendChild(buildKPI(35, 'kpi.worldwide', 'Worldwide Clients', {suffix:'+'}));
  wrap.appendChild(buildKPI('24h', 'kpi.response', 'Response Time'));
  wrap.appendChild(buildKPI('7d', 'kpi.support', '7‑day Support'));
    // Reapply translations if function exists
    const fns=['applyTranslations','refreshI18n','i18nApply','translatePage'];
    for(const n of fns){ if(typeof window[n]==='function'){ window[n](); return; } }
    // fallback translate only labels we control
    const lang=(document.documentElement.getAttribute('lang')||'en').toLowerCase();
    const dict=i18nObj()[lang]||{};
    wrap.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      if(dict[k]) el.textContent=dict[k];
    });
  }

  function init(){
    ensureCSS();
    extendI18N();
    rebuild();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
