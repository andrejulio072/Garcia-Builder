// Consent-aware loader for Google Ads / gtag
// Loads only after at least one of ad/analytics consents is granted.
(function(){
  if(window.__ADS_LOADER_INITIALIZED__) return; window.__ADS_LOADER_INITIALIZED__=true;
  const IDS = ['AW-17627402053']; // Extend if needed
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
      const s=document.createElement('script'); s.id='gtag-lib'; s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+IDS[0]; document.head.appendChild(s);
    }
    gtag('js', new Date());
    IDS.forEach(id=> gtag('config', id, { allow_enhanced_conversions:true }));
    window.__ADS_BASE_READY__=true;
    if(window.DEBUG_ADS) console.log('[ADS] gtag initialized (consent-aware)', IDS);
  }
  if(granted()) { load(); }
  else {
    window.addEventListener('consent_update', ev => {
      const ch = ev.detail?.choices||{};
      if(['ad_storage','analytics_storage','ad_user_data','ad_personalization'].some(k=>ch[k]==='granted')) load();
    });
  }
})();
