// Generic conversion helper and auto-binding
(function(){
  if (window.__CONVERSION_HELPER__) return; window.__CONVERSION_HELPER__=true;
  if (!window.gtag_report_conversion) {
    window.gtag_report_conversion = function(url){
      try{
        if (typeof gtag === 'function') {
          var callback = function(){ if(typeof url !== 'undefined'){ window.location = url; } };
          gtag('event','conversion',{
            'send_to':'AW-17627402053/mdOMCOTV3acbEMWes9VB',
            'value':1.0,
            'currency':'GBP',
            'event_callback':callback
          });
          return false;
        }
      }catch(e){}
      if (typeof url !== 'undefined') { window.location = url; }
      return false;
    };
  }
  // Auto-bind on WhatsApp/contact float or any link marked with data-track-conv
  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a.whatsapp-float, a.contact-float, a[data-track-conv]');
    if (a && a.href) {
      if (typeof window.gtag_report_conversion === 'function') {
        e.preventDefault();
        e.stopPropagation();
        return window.gtag_report_conversion(a.href);
      }
    }
  }, true);
})();
