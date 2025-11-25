// Consent-aware loader for Google Ads / gtag
// Loads only after at least one of ad/analytics consents is granted.
(function(){
  if(window.__ADS_LOADER_INITIALIZED__) return; window.__ADS_LOADER_INITIALIZED__=true;

  // Optional QA helper: force consent to granted when URL contains ?debug-consent=1
  // This allows Google Tag tests to detect the tag even when the default is denied.
  const DEBUG_CONSENT = typeof window !== 'undefined' &&
    window.location &&
    /[?&]debug-consent=1/.test(window.location.search || '');

  const DEBUG_GRANTED_CHOICES = {
    ad_storage: 'granted',
    analytics_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  };

  if (DEBUG_CONSENT) {
    try {
      localStorage.setItem('gb_consent_v1', JSON.stringify({
        status: 'granted',
        choices: DEBUG_GRANTED_CHOICES,
        ts: Date.now()
      }));
      window.__DEBUG_CONSENT__ = true;
      window.dispatchEvent(new CustomEvent('consent_update', { detail: { choices: DEBUG_GRANTED_CHOICES } }));
    } catch(_){}
  }

  function isValidGa4Id(id){
    return typeof id === 'string' && /^G-[A-Z0-9]+$/i.test(id.trim());
  }

  function resolveGa4Id(){
    const candidates = [];

    try {
      const cfgId = window.ADS_CONFIG && window.ADS_CONFIG.google && window.ADS_CONFIG.google.ga4MeasurementId;
      if (cfgId) candidates.push(cfgId);
    } catch(_){/* noop */}

    try {
      const envId = window.__ENV && window.__ENV.GA4_MEASUREMENT_ID;
      if (envId) candidates.push(envId);
    } catch(_){/* noop */}

    if (window.GA4_MEASUREMENT_ID) {
      candidates.push(window.GA4_MEASUREMENT_ID);
    }
    if (window.GA_MEASUREMENT_ID) {
      candidates.push(window.GA_MEASUREMENT_ID);
    }

    try {
      const htmlId = document && document.documentElement ? document.documentElement.getAttribute('data-ga4-id') : null;
      if (htmlId) candidates.push(htmlId);
    } catch(_){/* noop */}

    try {
      const meta = document && document.querySelector ? document.querySelector('meta[name="ga4:measurement_id"], meta[name="ga4-measurement-id"], meta[name="ga:measurement_id"]') : null;
      if (meta && meta.getAttribute('content')) {
        candidates.push(meta.getAttribute('content'));
      }
    } catch(_){/* noop */}

    for (let i = 0; i < candidates.length; i++) {
      const candidate = typeof candidates[i] === 'string' ? candidates[i].trim() : '';
      if (isValidGa4Id(candidate)) {
        return candidate.toUpperCase();
      }
    }
    return null;
  }

  const GA4_ID = resolveGa4Id();
  if (GA4_ID) {
    window.GA4_MEASUREMENT_ID = window.GA4_MEASUREMENT_ID || GA4_ID;
    window.__GA4_MEASUREMENT_ID__ = GA4_ID;
    if (window.ADS_CONFIG && window.ADS_CONFIG.google && !window.ADS_CONFIG.google.ga4MeasurementId) {
      window.ADS_CONFIG.google.ga4MeasurementId = GA4_ID;
    }
  }

  const baseIds = [];
  if (GA4_ID) {
    baseIds.push(GA4_ID);
  }
  baseIds.push('AW-17627402053');
  const IDS = Array.from(new Set(baseIds.filter(Boolean)));
  const PRIMARY_ID = IDS[0] || 'AW-17627402053';

  function granted(){
    try {
      const s = JSON.parse(localStorage.getItem('gb_consent_v1')||'null');
      const ch = s && s.choices || {};
      return ['ad_storage','analytics_storage','ad_user_data','ad_personalization'].some(k=>ch[k]==='granted');
    } catch(e){ return false; }
  }
  function load(){
    if(window.gtag && window.__ADS_BASE_READY__) return;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    if(!document.getElementById('gtag-lib')){
      const s=document.createElement('script');
      s.id='gtag-lib';
      s.async=true;
      s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(PRIMARY_ID);
      document.head.appendChild(s);
    }
    gtag('js', new Date());
    IDS.forEach(id => {
      if (!id) return;
      if (id.startsWith('AW-')) {
        gtag('config', id, { allow_enhanced_conversions:true, send_page_view:false });
      } else {
        gtag('config', id);
      }
    });
    window.__ADS_BASE_READY__=true;
    if(window.DEBUG_ADS) console.log('[ADS] gtag initialized (consent-aware)', IDS);

    // If QA override is active, explicitly update consent to granted after gtag loads.
    if (DEBUG_CONSENT) {
      try { gtag('consent','update', DEBUG_GRANTED_CHOICES); } catch(_){}
    }
  }
  if(granted()) { load(); }
  else {
    window.addEventListener('consent_update', ev => {
      const ch = ev.detail?.choices||{};
      if(['ad_storage','analytics_storage','ad_user_data','ad_personalization'].some(k=>ch[k]==='granted')) load();
    });
  }
})();
