// Engagement Tracking v1
// Scroll depth + lead magnet clicks
(function(){
  const dl = window.dataLayer = window.dataLayer || [];
  const sent = new Set([0]);
  const marks = [25,50,75,100];
  function check(){
    const st = window.scrollY || document.documentElement.scrollTop;
    const dh = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const wh = window.innerHeight;
    const pct = Math.min(100, Math.round(((st+wh)/dh)*100));
    marks.forEach(m=>{ if(pct>=m && !sent.has(m)){ sent.add(m); dl.push({event:'scroll_depth', percent:m}); }});
  }
  let ticking=false; window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(()=>{check(); ticking=false;}); ticking=true; }});
  document.addEventListener('click', e=>{ const lm = e.target.closest('[data-open-lead-magnet]'); if(lm){ dl.push({event:'download_guide', guide_id: lm.getAttribute('data-guide-id')||'default'}); }});
})();
