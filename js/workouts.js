(function () {
  'use strict';

  const filters = {
    goal: 'all',
    level: 'all',
    place: 'all'
  };

  const cards = Array.from(document.querySelectorAll('.workout-card'));
  const buttons = Array.from(document.querySelectorAll('[data-filter-group]'));
  const search = document.getElementById('workout-search');
  const count = document.getElementById('workout-count');
  const noResults = document.getElementById('no-results');
  const jumpLinks = Array.from(document.querySelectorAll('[data-jump-filter]'));

  const tokenList = (value) => (value || '').toLowerCase().split(/\s+/).filter(Boolean);

  const matchesFilter = (card, group, value) => {
    if (value === 'all') return true;
    const source = group === 'place' ? card.dataset.place : card.dataset[group];
    return tokenList(source).includes(value);
  };

  const matchesSearch = (card, term) => {
    if (!term) return true;
    const haystack = [
      card.textContent,
      card.dataset.goal,
      card.dataset.level,
      card.dataset.place,
      card.dataset.audience
    ].join(' ').toLowerCase();
    return haystack.includes(term);
  };

  const setButtonState = (group, value) => {
    buttons
      .filter((button) => button.dataset.filterGroup === group)
      .forEach((button) => {
        const isActive = button.dataset.filter === value;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
  };

  const applyFilters = () => {
    const term = (search?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const isVisible =
        matchesFilter(card, 'goal', filters.goal) &&
        matchesFilter(card, 'level', filters.level) &&
        matchesFilter(card, 'place', filters.place) &&
        matchesSearch(card, term);

      card.hidden = !isVisible;
      if (isVisible) visible += 1;
    });

    if (count) count.textContent = String(visible);
    if (noResults) noResults.hidden = visible !== 0;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.dataset.filterGroup;
      const value = button.dataset.filter;
      filters[group] = value;
      setButtonState(group, value);
      applyFilters();
    });
  });

  search?.addEventListener('input', applyFilters);

  jumpLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const value = link.dataset.jumpFilter;
      const group = value === 'home' ? 'place' : 'goal';
      filters.goal = 'all';
      filters.level = 'all';
      filters.place = 'all';
      filters[group] = value;
      if (search) search.value = '';
      setButtonState('goal', filters.goal);
      setButtonState('level', filters.level);
      setButtonState('place', filters.place);
      applyFilters();
    });
  });

  applyFilters();
})();
