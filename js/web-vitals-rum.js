// Lightweight Web Vitals RUM collector (LCP, CLS, FID) + optional FCP, INP (graceful)
// Pushes events into dataLayer for GA4 custom events
// idempotent: safe to include once
(function(){
  if (window.__WEB_VITALS_RUM_LOADED__) return; window.__WEB_VITALS_RUM_LOADED__=true;
  window.dataLayer = window.dataLayer || [];
  function push(metric){
    try {
      dataLayer.push({
        event: 'web_vital',
        metric_name: metric.name,
        metric_id: metric.id || metric.name + '-' + Date.now(),
        value: Math.round(metric.value * 1000) / 1000
      });
    } catch(e) { /* silent */ }
  }
  const W = window;
  function observe(type, cb){
    if (!('PerformanceObserver' in W)) return;
    try { new PerformanceObserver(list => { list.getEntries().forEach(cb); }).observe({type, buffered:true}); } catch(_){}
  }
  // LCP
  observe('largest-contentful-paint', entry => push({name:'LCP', value:(entry.renderTime||entry.loadTime||entry.startTime), id: entry.id}));
  // CLS
  if ('PerformanceObserver' in W) {
    try {
      let clsValue = 0;
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => { if(!e.hadRecentInput) clsValue += e.value; });
      }).observe({type:'layout-shift', buffered:true});
      addEventListener('beforeunload', () => push({name:'CLS', value:clsValue, id:'cls-final'}));
    } catch(_){}
  }
  // FID
  observe('first-input', entry => push({name:'FID', value:(entry.processingStart - entry.startTime), id: entry.id}));
  // FCP (optional insight)
  observe('paint', entry => { if(entry.name==='first-contentful-paint') push({name:'FCP', value:entry.startTime, id: entry.name}); });
  // INP (experimental; Chrome >= 118) - long interaction responsiveness
  observe('interaction', entry => {
    // Largest interaction latency approximation
    push({name:'INP', value: entry.duration, id: entry.interactionId || 'inp'});
  });
})();