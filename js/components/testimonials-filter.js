(() => {
  // Testimonials filtering functionality
  const filterButtons = document.querySelectorAll('.filter-btn');
  const testimonialCards = document.querySelectorAll('.tcard');

  if (!filterButtons.length || !testimonialCards.length) return;

  // Counter for visible testimonials
  const updateVisibleCount = () => {
    const visibleCards = document.querySelectorAll('.tcard:not([style*="display: none"])');
    console.log(`Showing ${visibleCards.length} testimonials`);
  };

  // Filter testimonials based on category
  const filterTestimonials = (category) => {
    testimonialCards.forEach(card => {
      const cardCategories = card.dataset.category || '';
      const shouldShow = category === 'all' || cardCategories.includes(category);

      if (shouldShow) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.transition = 'opacity 0.3s ease';
          card.style.opacity = '1';
        }, 50);
      } else {
        card.style.transition = 'opacity 0.2s ease';
        card.style.opacity = '0';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });

    setTimeout(updateVisibleCount, 300);
  };

  // Add click handlers to filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to clicked button
      button.classList.add('active');

      // Filter testimonials
      const category = button.dataset.filter;
      filterTestimonials(category);
    });
  });

  // Add click handlers for testimonial cards (optional interaction)
  testimonialCards.forEach(card => {
    card.addEventListener('click', () => {
      // Add a subtle feedback animation
      card.style.transform = 'scale(0.98)';
      setTimeout(() => {
        card.style.transform = '';
      }, 150);
    });
  });

  // Initialize view
  updateVisibleCount();

  // Add keyboard navigation for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') {
      const buttonIndex = parseInt(e.key) - 1;
      if (filterButtons[buttonIndex]) {
        filterButtons[buttonIndex].click();
      }
    }
  });

  console.log('Testimonials filter system initialized');
})();
