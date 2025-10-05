// Central Facebook Pixel Loader - Garcia Builder
// Usage in HTML before other fbq calls:
// <script>window.FB_PIXEL_ID='YOUR_PIXEL_ID';</script>
// <script defer src="js/pixel-init.js"></script>
// Optional events can wait for `pixel:ready` event.
(function initPixel(pid){
  const ADS_ALLOWED = (function(){
    try {
      const c = JSON.parse(localStorage.getItem('gb_consent_v1')||'null');
      if(!c) return false; const ch = c.choices||{};
      return ['ad_storage','ad_user_data','ad_personalization'].some(k=>ch[k]==='granted');
    } catch(e){ return false; }
  })();
  if(!pid || pid === 'FACEBOOK_PIXEL_ID'){
    console.warn('[Pixel] Nenhum ID definido ou placeholder. Pixel não inicializado.');
    return;
  }
  if(!ADS_ALLOWED){
    console.info('[Pixel] Aguardando consentimento para ads antes de inicializar.');
    window.addEventListener('consent_update', function(ev){
      const ch = ev.detail?.choices||{};
      if(['ad_storage','ad_user_data','ad_personalization'].some(k=>ch[k]==='granted')){
        initPixel(pid); // re-chama após consent
      }
    }, { once:true });
    return;
  }
  if(window.fbq){ console.info('[Pixel] Já inicializado.'); return; }
  !function(f,b,e,v,n,t,s){ if(f.fbq)return; n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments):n.queue.push(arguments); }; if(!f._fbq)f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[]; t=b.createElement(e); t.async=!0; t.src=v; s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s); }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
  try {
    fbq('init', pid);
    fbq('track','PageView');
    window.dispatchEvent(new CustomEvent('pixel:ready',{detail:{id:pid}}));
    console.info('[Pixel] Inicializado com ID', pid);
  } catch(e){ console.error('[Pixel] Falha ao inicializar:', e); }
})(window.FB_PIXEL_ID);

// Helper to buffer fbq calls if script not ready yet
window.queueFbq = function(){
  var args = arguments;
  if(typeof fbq === 'function') return fbq.apply(null, args);
  (window.__fbqQueue = window.__fbqQueue || []).push(args);
};
window.addEventListener('pixel:ready', function(){
  if(window.__fbqQueue && window.__fbqQueue.length){
    window.__fbqQueue.forEach(function(a){ try { fbq.apply(null,a);} catch(e){} });
    window.__fbqQueue = [];
  }
});
