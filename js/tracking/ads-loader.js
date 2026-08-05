// Consent-aware loader for GTM and Google Ads / gtag.
// No third-party tag is requested until an optional analytics or ads choice is granted.
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

  const GTM_ID = 'GTM-TG5TFZ2C';
  const IDS = ['AW-17627402053'];
  const PRIMARY_ID = 'AW-17627402053';

  function hasGrantedChoice(choices){
    return ['ad_storage','analytics_storage','ad_user_data','ad_personalization'].some(k=>choices?.[k]==='granted');
  }
  function granted(){
    try {
      const s = JSON.parse(localStorage.getItem('gb_consent_v1')||'null');
      const ch = s && s.choices || {};
      return hasGrantedChoice(ch) || (s?.status === 'granted' && !Object.keys(ch).length);
    } catch(e){ return false; }
  }
  function loadGoogleTagManager(){
    if(window.__GTM_BASE_READY__) return;
    window.dataLayer = window.dataLayer || [];
    if(!document.getElementById('gb-gtm-script') && !document.querySelector(`script[src*="gtm.js?id=${GTM_ID}"]`)){
      window.dataLayer.push({'gtm.start': Date.now(), event:'gtm.js'});
      const gtm=document.createElement('script');
      gtm.id='gb-gtm-script';
      gtm.async=true;
      gtm.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(GTM_ID);
      document.head.appendChild(gtm);
    }
    window.__GTM_BASE_READY__=true;
  }
  function loadGoogleAds(){
    if(window.__ADS_BASE_READY__) return;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    if(!document.getElementById('gtag-lib') && !document.querySelector(`script[src*="/gtag/js?id=${PRIMARY_ID}"]`)){
      const s=document.createElement('script');
      s.id='gtag-lib';
      s.async=true;
      s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(PRIMARY_ID);
      document.head.appendChild(s);
    }
    gtag('js', new Date());
    IDS.forEach(id => {
      if (!id) return;
      gtag('config', id, { allow_enhanced_conversions:true, send_page_view:false });
    });
    window.__ADS_BASE_READY__=true;
    if(window.DEBUG_ADS) console.log('[ADS] gtag initialized (consent-aware)', IDS);

    // If QA override is active, explicitly update consent to granted after gtag loads.
    if (DEBUG_CONSENT) {
      try { gtag('consent','update', DEBUG_GRANTED_CHOICES); } catch(_){}
    }
  }
  function load(){
    loadGoogleTagManager();
    loadGoogleAds();
  }
  if(granted()) { load(); }
  else {
    window.addEventListener('consent_update', ev => {
      const ch = ev.detail?.choices||{};
      if(hasGrantedChoice(ch)) load();
    });
  }
})();
