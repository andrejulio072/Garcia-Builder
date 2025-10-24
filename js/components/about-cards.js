// About cards tilt + shine effect
(function(){
  const cards = document.querySelectorAll('.card.feature');
  if(!cards.length) return;

  const maxTilt = 10;

  function onMove(e){
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const rx = (-(e.clientY-(r.top+r.height/2))/(r.height/2))*maxTilt;
    const ry = ((e.clientX-(r.left+r.width/2))/(r.width/2))*maxTilt;
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', mx+'%');
    card.style.setProperty('--my', my+'%');
  }

  function onLeave(e){
    e.currentTarget.style.transform='';
  }

  cards.forEach(c=>{
    if(!c.querySelector('.shine')) {
      c.insertAdjacentHTML('beforeend','<span class="shine" aria-hidden="true"></span>');
    }
    c.addEventListener('mousemove', onMove, {passive:true});
    c.addEventListener('mouseleave', onLeave, {passive:true});
  });
})();
