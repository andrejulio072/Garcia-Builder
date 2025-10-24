/* UTM & Attribution Capture v1.0
 * - Captures utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid
 * - Persists in localStorage for session (7 days refresh)
 * - Injects hidden inputs into forms with data-attr-track or matching known lead/newsletter/contact forms
 * - Pushes a dataLayer event 'session_attribution_ready'
 */
(function(){
  const STORAGE_KEY = 'gb_attrib_v1';
  const TTL_MS = 7*24*60*60*1000; // 7 days
  const params = new URLSearchParams(window.location.search);
  const KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];

  function load(){
    try { const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return null; const obj = JSON.parse(raw); if(Date.now()-obj._ts>TTL_MS) {localStorage.removeItem(STORAGE_KEY); return null;} return obj; } catch(e){return null;}
  }
  function save(data){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){} }

  let current = load() || {_ts:Date.now()};
  let touched = false;
  KEYS.forEach(k=>{
    if(params.has(k) && params.get(k)) { current[k]=params.get(k); touched=true; }
  });
  if(touched){ current._ts = Date.now(); save(current); }

  // Ensure mandatory fallback classification if no attribution yet
  if(!current.utm_source) { current.utm_source = 'direct'; current.utm_medium = 'none'; }

  // Expose globally (read-only clone)
  window.GB_ATTRIBUTION = Object.freeze(Object.assign({}, current));

  function injectHiddenInputs(form){
    if(!form || form.__utmInjected) return; form.__utmInjected = true;
    KEYS.forEach(k=>{
      const v = current[k];
      if(v){
        let input = form.querySelector('input[name="'+k+'"]');
        if(!input){
          input = document.createElement('input');
          input.type='hidden'; input.name=k; form.appendChild(input);
        }
        input.value = v;
      }
    });
    // Derived channel grouping example
    if(!form.querySelector('input[name="channel_grouping"]')){
      const cg = document.createElement('input');
      cg.type='hidden'; cg.name='channel_grouping';
      cg.value = deriveChannel(current);
      form.appendChild(cg);
    }
  }

  function deriveChannel(a){
    const src = (a.utm_source||'').toLowerCase();
    const med = (a.utm_medium||'').toLowerCase();
    if(med==='cpc' || med==='ppc' || med==='paid_social') return 'Paid';
    if(src.includes('google') && med==='organic') return 'Organic Search';
    if(['facebook','instagram','ig'].some(s=>src.includes(s)) && med!=='paid_social') return 'Organic Social';
    if(src==='direct') return 'Direct';
    return 'Other';
  }

  function scan(){
    const forms = document.querySelectorAll('form.hero-lead-form, form#contact-form, form.newsletter-form, form[data-attr-track]');
    forms.forEach(injectHiddenInputs);
  }

  document.addEventListener('DOMContentLoaded', scan);
  // In case forms are injected late
  setTimeout(scan, 1500);

  // dataLayer push
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'session_attribution_ready',
    attribution: current
  });
})();
