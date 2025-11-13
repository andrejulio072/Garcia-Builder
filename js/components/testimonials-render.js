(function(){
  const grid = document.getElementById('testimonials-grid');
  if (!grid || !window.GB_TESTIMONIALS) { return; }

  const filterButtons = Array.from(document.querySelectorAll('.filter-btn')).map(btn => ({
    el: btn,
    filter: btn.getAttribute('data-filter') || 'all',
    label: btn.dataset.label || btn.textContent.trim()
  }));
  filterButtons.forEach(({ el, label }) => { el.dataset.label = label; });

  const searchInput = document.getElementById('testimonial-search');
  const countEl = document.getElementById('testimonial-count');
  const spotlightEl = document.getElementById('testimonial-spotlight');

  const star = n => '★★★★★'.slice(0, Math.max(0, Math.min(5, n)));
  const translate = (key, fallback) => {
    if (!key) return fallback;
    try {
      const lang = (window.GB_I18N && typeof window.GB_I18N.getLang === 'function') ? window.GB_I18N.getLang() : 'en';
      const dicts = window.DICTS || {};
      const resolve = (src) => key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, src);
      return resolve(dicts[lang]) ?? resolve(dicts.en) ?? fallback;
    } catch (err) {
      console.warn('i18n lookup failed for testimonial', key, err);
      return fallback;
    }
  };

  const getInitials = (name) => {
    if (!name || name.toLowerCase() === 'anonymous') return 'AN';
    return name.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  };

  const formatCategory = (slug) => {
    const mapping = {
      'weight-loss': 'Weight loss',
      'muscle-gain': 'Muscle gain',
      'transformation': 'Body recomposition',
      'health': 'Health & wellness',
      'performance': 'Performance',
      'lifestyle': 'Lifestyle',
      'identified': 'Identified',
      'anonymous': 'Anonymous'
    };
    return mapping[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const escapeHtml = (value = '') => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const makeCard = (t, idx) => {
    const isAnon = !!t.categories?.includes('anonymous') || t.name.toLowerCase() === 'anonymous';
    const aria = `Testimonial from ${isAnon ? 'Anonymous' : t.name}`;
    const cat = (t.categories || []).join(' ');

    const avatar = (!isAnon && t.imageUrl)
      ? `<img src="${t.imageUrl}" alt="${t.name} avatar" width="60" height="60" loading="lazy" />`
      : `<div class="testimonial-avatar avatar-${(idx % 10) + 1}" aria-hidden="true">${getInitials(t.name)}</div>`;

    const cardText = translate(t.textKey, t.text);

    return `
      <div class="card tcard" data-category="${cat}" role="listitem" tabindex="0" aria-label="${aria}">
        ${avatar}
        <div>
          <div class="name">${isAnon ? 'Anonymous' : t.name}</div>
          <span class="badge" aria-label="${t.rating} star rating">${star(t.rating)}</span>
          <p>${cardText}</p>
        </div>
      </div>
    `;
  };

  const identified = window.GB_TESTIMONIALS.filter(t => !(t.categories || []).includes('anonymous'));
  const anonymous = window.GB_TESTIMONIALS.filter(t => (t.categories || []).includes('anonymous'));
  const ordered = [...identified, ...anonymous];
  grid.innerHTML = ordered.map((t, i) => makeCard(t, i)).join('');

  const meta = Array.from(grid.querySelectorAll('.tcard')).map((el, idx) => {
    const categories = (el.getAttribute('data-category') || '').split(/\s+/).filter(Boolean);
    const name = (el.querySelector('.name')?.textContent || '').toLowerCase();
    const text = (el.querySelector('p')?.textContent || '').toLowerCase();
    return {
      el,
      categories,
      searchText: `${name} ${text}`.trim(),
      data: ordered[idx]
    };
  });

  let activeFilter = filterButtons.find(({ el }) => el.classList.contains('active'))?.filter || 'all';

  const setFilterState = (nextFilter) => {
    activeFilter = nextFilter;
    filterButtons.forEach(({ el, filter }) => {
      const isActive = filter === nextFilter;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  };

  const updateCount = (visibleCount) => {
    if (!countEl) { return; }
    if (!visibleCount) {
      countEl.textContent = 'No testimonials match these filters yet. Try adjusting your search or reset the filters.';
      return;
    }
    const label = visibleCount === 1 ? 'story' : 'stories';
    countEl.innerHTML = `Showing <strong>${visibleCount}</strong> ${label}`;
  };

  const updateFilterButtonCounts = (visibleList) => {
    const counts = new Map();
    counts.set('all', visibleList.length);
    visibleList.forEach(item => {
      item.categories.forEach(cat => counts.set(cat, (counts.get(cat) || 0) + 1));
    });
    filterButtons.forEach(({ el, filter, label }) => {
      const value = counts.get(filter) || 0;
      el.textContent = `${label} (${value})`;
    });
  };

  const updateSpotlight = (visibleList) => {
    if (!spotlightEl) { return; }

    if (!visibleList.length) {
      spotlightEl.hidden = false;
      spotlightEl.innerHTML = `
        <div class="spotlight-empty">
          No testimonials match the current search. Clear the search box or choose a different category to explore more stories.
        </div>
      `;
      return;
    }

    const preferred = visibleList.find(item => item.categories.includes('transformation')) || visibleList[0];
    const { data, categories } = preferred;
    const name = preferred.el.querySelector('.name')?.textContent || data.name;
    const paragraphText = preferred.el.querySelector('p')?.textContent?.trim() || data.text || '';
    const copyPayload = paragraphText;
    const badgeList = categories.filter(cat => !['anonymous', 'identified'].includes(cat));
    const safeParagraph = escapeHtml(paragraphText).replace(/\n/g, '<br>');

    const media = (!categories.includes('anonymous') && data.imageUrl)
      ? `<img src="${data.imageUrl}" alt="${escapeHtml(name)}" loading="lazy" />`
      : `<div class="spotlight-avatar">${getInitials(name)}</div>`;

    spotlightEl.hidden = false;
    spotlightEl.innerHTML = `
      <div class="spotlight-card" role="region" aria-label="Featured success story">
        <div class="spotlight-media">${media}</div>
        <div class="spotlight-body">
          <span class="spotlight-eyebrow">Spotlight</span>
          <h2>${escapeHtml(name)}</h2>
          <div class="spotlight-meta">
            <span class="spotlight-rating" aria-label="${data.rating} out of 5">${star(data.rating)}</span>
            <button type="button" class="spotlight-copy" data-clipboard="${escapeHtml(copyPayload)}">Copy testimonial</button>
          </div>
          <p>${safeParagraph}</p>
          <div class="spotlight-tags">
            ${badgeList.length ? badgeList.map(cat => `<span class="spotlight-tag">${escapeHtml(formatCategory(cat))}</span>`).join('') : '<span class="spotlight-tag">Client success</span>'}
          </div>
        </div>
      </div>
    `;

    const copyBtn = spotlightEl.querySelector('.spotlight-copy');
    if (copyBtn) {
      copyBtn.dataset.clipboard = copyPayload;
      copyBtn.addEventListener('click', async () => {
        const original = copyBtn.textContent;
        const payload = copyBtn.dataset.clipboard || '';
        try {
          await navigator.clipboard.writeText(payload);
          copyBtn.textContent = 'Copied!';
        } catch (err) {
          console.warn('Clipboard copy failed', err);
          copyBtn.textContent = 'Copy manually';
        }
        setTimeout(() => { copyBtn.textContent = original; }, 2200);
      });
    }
  };

  const applyFilters = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const visible = [];

    meta.forEach(item => {
      const matchesFilter = activeFilter === 'all' || item.categories.includes(activeFilter);
      const matchesQuery = !query || item.searchText.includes(query);
      const shouldShow = matchesFilter && matchesQuery;
      item.el.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible.push(item);
      }
    });

    updateCount(visible.length);
    updateFilterButtonCounts(visible);
    updateSpotlight(visible);
  };

  filterButtons.forEach(({ el, filter }) => {
    el.addEventListener('click', () => {
      if (filter === activeFilter) { return; }
      setFilterState(filter);
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
    searchInput.addEventListener('search', applyFilters);
  }

  setFilterState(activeFilter);
  applyFilters();

  const compact = document.getElementById('view-compact');
  const comfy = document.getElementById('view-comfy');
  if (compact && comfy) {
    compact.addEventListener('click', () => {
      grid.classList.add('compact');
      grid.classList.remove('comfy');
      compact.setAttribute('aria-pressed', 'true');
      comfy.setAttribute('aria-pressed', 'false');
    });
    comfy.addEventListener('click', () => {
      grid.classList.add('comfy');
      grid.classList.remove('compact');
      comfy.setAttribute('aria-pressed', 'true');
      compact.setAttribute('aria-pressed', 'false');
    });
  }
})();
