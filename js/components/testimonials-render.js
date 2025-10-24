(function(){
  const grid = document.getElementById('testimonials-grid');
  if(!grid || !window.GB_TESTIMONIALS){ return; }

  const star = n => '★★★★★'.slice(0, Math.max(0, Math.min(5, n)));
  const getInitials = (name) => {
    if(!name || name.toLowerCase() === 'anonymous') return 'AN';
    return name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase();
  };

  const makeCard = (t, idx) => {
    const isAnon = !!t.categories?.includes('anonymous') || t.name.toLowerCase()==='anonymous';
    const aria = `Testimonial from ${isAnon? 'Anonymous' : t.name}`;
    const cat = (t.categories||[]).join(' ');

    // avatar: if imageUrl present and not anonymous, use <img>; else initials gradient
    const avatar = (!isAnon && t.imageUrl)
      ? `<img src="${t.imageUrl}" alt="${t.name} avatar" width="60" height="60" loading="lazy" />`
      : `<div class="testimonial-avatar avatar-${(idx%10)+1}" aria-hidden="true">${getInitials(t.name)}</div>`;

    return `
      <div class="card tcard" data-category="${cat}" role="listitem" tabindex="0" aria-label="${aria}">
        ${avatar}
        <div>
          <div class="name">${isAnon? 'Anonymous' : t.name}</div>
          <span class="badge" aria-label="${t.rating} star rating">${star(t.rating)}</span>
          <p>${t.text}</p>
        </div>
      </div>
    `;
  };

  // Initial render (identified first, then anonymous)
  const identified = window.GB_TESTIMONIALS.filter(t=>!(t.categories||[]).includes('anonymous'));
  const anonymous = window.GB_TESTIMONIALS.filter(t=>(t.categories||[]).includes('anonymous'));
  const ordered = [...identified, ...anonymous];
  grid.innerHTML = ordered.map((t,i)=> makeCard(t,i)).join('');

  // Filtering
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn=>{
    btn.addEventListener('click', e =>{
      filterButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      const cards = grid.querySelectorAll('.tcard');
      cards.forEach(card => {
        const cats = (card.getAttribute('data-category')||'').split(/\s+/);
        const show = filter==='all' || cats.includes(filter);
        card.style.display = show ? '' : 'none';
      });
    });
  });

  // View toggles
  const compact = document.getElementById('view-compact');
  const comfy = document.getElementById('view-comfy');
  if (compact && comfy){
    compact.addEventListener('click', ()=>{ grid.classList.add('compact'); grid.classList.remove('comfy'); compact.setAttribute('aria-pressed','true'); comfy.setAttribute('aria-pressed','false'); });
    comfy.addEventListener('click', ()=>{ grid.classList.add('comfy'); grid.classList.remove('compact'); comfy.setAttribute('aria-pressed','true'); compact.setAttribute('aria-pressed','false'); });
  }
})();
