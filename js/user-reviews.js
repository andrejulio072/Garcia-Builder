// User Reviews System
(() => {
  let currentUser = null;
  let allReviews = [];

  const init = () => {
    // Verificar se o usuário está logado
    checkUserAuth();

    // Inicializar sistema se estivermos na página de testimonials
    if (window.location.pathname.includes('testimonials')) {
      initializeReviewsSystem();
    }
  };

  const checkUserAuth = async () => {
    try {
      if (window.supabaseClient) {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        if (!error && user) {
          currentUser = user;
          console.log('✅ User authenticated for reviews:', user.email);
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }
  };

  const initializeReviewsSystem = async () => {
    // Adicionar botão "Write Review" se usuário estiver logado
    if (currentUser) {
      addWriteReviewButton();
    }

    // Carregar reviews dos usuários
    await loadUserReviews();

    // Mesclar com testimonials existentes
    integrateWithTestimonials();
  };

  const addWriteReviewButton = () => {
    const statsSection = document.querySelector('.testimonial-stats');
    if (!statsSection) return;

    const writeReviewHTML = `
      <div class="write-review-section mt-4">
        <button class="btn btn-gradient" id="write-review-btn">
          <i class="fas fa-star me-2"></i>Write Your Review
        </button>
      </div>
    `;

    statsSection.insertAdjacentHTML('afterend', writeReviewHTML);

    // Adicionar event listener
    document.getElementById('write-review-btn').addEventListener('click', showReviewModal);
  };

  const showReviewModal = () => {
    const modalHTML = `
      <div class="modal fade" id="reviewModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content" style="background: rgba(15, 15, 15, 0.95); border: 1px solid rgba(246, 200, 78, 0.3); color: #fff;">
            <div class="modal-header border-0">
              <h5 class="modal-title text-warning">
                <i class="fas fa-star me-2"></i>Share Your Experience
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="reviewForm">
                <!-- Rating Section -->
                <div class="mb-4">
                  <label class="form-label text-readable mb-3">
                    <i class="fas fa-star me-1 text-warning"></i>Overall Rating
                  </label>
                  <div class="star-rating-input" id="starRating">
                    ${Array.from({length: 5}, (_, i) =>
                      `<i class="fas fa-star star-input" data-rating="${i + 1}"></i>`
                    ).join('')}
                  </div>
                  <div class="rating-text mt-2" id="ratingText">Click to rate</div>
                </div>

                <!-- Review Text -->
                <div class="mb-4">
                  <label class="form-label text-readable">
                    <i class="fas fa-comment me-1 text-warning"></i>Your Review
                  </label>
                  <textarea class="form-control" id="reviewText" rows="6"
                            placeholder="Share your experience with Garcia Builder coaching. What results did you achieve? How was the training and support?"
                            maxlength="1000" required></textarea>
                  <div class="text-end mt-1">
                    <small class="text-muted" id="charCount">0/1000</small>
                  </div>
                </div>

                <!-- Category -->
                <div class="mb-4">
                  <label class="form-label text-readable">
                    <i class="fas fa-tag me-1 text-warning"></i>Category
                  </label>
                  <select class="form-select" id="reviewCategory" required>
                    <option value="">Select category</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="transformation">Body Recomposition</option>
                    <option value="health">Health & Wellness</option>
                  </select>
                </div>

                <!-- Optional Fields -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-clock me-1 text-warning"></i>Coaching Duration
                    </label>
                    <select class="form-select" id="coachingDuration">
                      <option value="">Optional</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="12+ months">12+ months</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label text-readable">
                      <i class="fas fa-target me-1 text-warning"></i>Main Goal Achieved
                    </label>
                    <select class="form-select" id="goalAchieved">
                      <option value="">Optional</option>
                      <option value="Exceeded expectations">Exceeded expectations</option>
                      <option value="Met expectations">Met expectations</option>
                      <option value="Partially achieved">Partially achieved</option>
                      <option value="Still working on it">Still working on it</option>
                    </select>
                  </div>
                </div>

                <!-- Privacy Notice -->
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Your review will be displayed with your name and may be featured on the website.
                  Reviews are moderated before publication.
                </div>
              </form>
            </div>
            <div class="modal-footer border-0">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-gradient" id="submitReview">
                <i class="fas fa-paper-plane me-1"></i>Submit Review
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal existente se houver
    const existingModal = document.getElementById('reviewModal');
    if (existingModal) existingModal.remove();

    // Adicionar modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inicializar funcionalidades do modal
    initializeReviewModal();

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
  };

  const initializeReviewModal = () => {
    // Star rating functionality
    const stars = document.querySelectorAll('.star-input');
    const ratingText = document.getElementById('ratingText');
    let selectedRating = 0;

    stars.forEach((star, index) => {
      star.addEventListener('mouseenter', () => {
        highlightStars(index + 1);
        ratingText.textContent = getRatingText(index + 1);
      });

      star.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
        ratingText.textContent = selectedRating > 0 ? getRatingText(selectedRating) : 'Click to rate';
      });

      star.addEventListener('click', () => {
        selectedRating = index + 1;
        highlightStars(selectedRating);
        ratingText.textContent = getRatingText(selectedRating);

        // Add selected class
        stars.forEach(s => s.classList.remove('selected'));
        for (let i = 0; i <= index; i++) {
          stars[i].classList.add('selected');
        }
      });
    });

    // Character counter
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');

    reviewText.addEventListener('input', () => {
      const count = reviewText.value.length;
      charCount.textContent = `${count}/1000`;
      charCount.className = count > 900 ? 'text-warning' : 'text-muted';
    });

    // Submit button
    document.getElementById('submitReview').addEventListener('click', submitReview);
  };

  const highlightStars = (count) => {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
      if (index < count) {
        star.classList.add('text-warning');
        star.classList.remove('text-muted');
      } else {
        star.classList.remove('text-warning');
        star.classList.add('text-muted');
      }
    });
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || 'Click to rate';
  };

  const submitReview = async () => {
    try {
      const submitBtn = document.getElementById('submitReview');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Submitting...';

      // Validar dados
      const rating = document.querySelectorAll('.star-input.selected').length;
      const reviewText = document.getElementById('reviewText').value.trim();
      const category = document.getElementById('reviewCategory').value;

      if (rating === 0) {
        throw new Error('Please select a rating');
      }
      if (!reviewText) {
        throw new Error('Please write your review');
      }
      if (!category) {
        throw new Error('Please select a category');
      }

      // Preparar dados da review
      const reviewData = {
        user_id: currentUser.id,
        user_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        user_email: currentUser.email,
        rating: rating,
        review_text: reviewText,
        category: category,
        coaching_duration: document.getElementById('coachingDuration').value || null,
        goal_achieved: document.getElementById('goalAchieved').value || null,
        status: 'pending', // Para moderação
        created_at: new Date().toISOString()
      };

      // Salvar no Supabase (se disponível) ou localStorage
      await saveReview(reviewData);

      // Mostrar sucesso
      showNotification('✅ Review submitted successfully! It will be reviewed before publication.', 'success');

      // Fechar modal
      bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();

      // Recarregar reviews
      setTimeout(() => {
        loadUserReviews();
      }, 1000);

    } catch (error) {
      console.error('Review submission error:', error);
      showNotification(`❌ ${error.message}`, 'error');
    } finally {
      const submitBtn = document.getElementById('submitReview');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Submit Review';
    }
  };

  const saveReview = async (reviewData) => {
    try {
      if (window.supabaseClient) {
        // Tentar salvar no Supabase
        const { error } = await window.supabaseClient
          .from('user_reviews')
          .insert([reviewData]);

        if (error) throw error;
        console.log('✅ Review saved to Supabase');

      } else {
        // Fallback para localStorage
        const existingReviews = JSON.parse(localStorage.getItem('gb_user_reviews') || '[]');
        reviewData.id = Date.now().toString();
        existingReviews.push(reviewData);
        localStorage.setItem('gb_user_reviews', JSON.stringify(existingReviews));
        console.log('✅ Review saved to localStorage');
      }
    } catch (error) {
      console.error('❌ Error saving review:', error);
      throw new Error('Failed to save review. Please try again.');
    }
  };

  const loadUserReviews = async () => {
    try {
      let reviews = [];

      if (window.supabaseClient) {
        // Carregar do Supabase
        const { data, error } = await window.supabaseClient
          .from('user_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!error && data) {
          reviews = data;
        }
      }

      // Fallback para localStorage
      if (reviews.length === 0) {
        reviews = JSON.parse(localStorage.getItem('gb_user_reviews') || '[]')
          .filter(review => review.status === 'approved');
      }

      allReviews = reviews;
      console.log(`📝 Loaded ${reviews.length} user reviews`);

    } catch (error) {
      console.error('❌ Error loading reviews:', error);
    }
  };

  const integrateWithTestimonials = () => {
    // Integrar reviews de usuários com testimonials existentes
    if (allReviews.length === 0) return;

    const testimonialsGrid = document.querySelector('.grid.grid-3');
    if (!testimonialsGrid) return;

    allReviews.forEach(review => {
      const reviewCard = createReviewCard(review);
      testimonialsGrid.insertAdjacentHTML('beforeend', reviewCard);
    });

    // Atualizar filtros para incluir as novas reviews
    if (window.TestimonialsFilter) {
      window.TestimonialsFilter.updateCards();
    }
  };

  const createReviewCard = (review) => {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=667eea&color=fff&size=128`;

    return `
      <div class="card tcard user-review" data-category="${review.category}">
        <img loading="lazy" decoding="async" src="${avatarUrl}" alt="${review.user_name}"/>
        <div>
          <div class="name">${review.user_name}</div>
          <span class="badge">${stars}</span>
          <div class="review-meta">
            <small class="text-warning">
              <i class="fas fa-user me-1"></i>Verified Client
              ${review.coaching_duration ? ` • ${review.coaching_duration}` : ''}
            </small>
          </div>
          <p>${review.review_text}</p>
          ${review.goal_achieved ? `<div class="goal-achieved"><small><i class="fas fa-target me-1"></i>${review.goal_achieved}</small></div>` : ''}
        </div>
      </div>
    `;
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  };

  // CSS para o sistema de reviews
  const addReviewStyles = () => {
    const styles = `
      <style>
        .star-rating-input {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .star-input {
          cursor: pointer;
          transition: all 0.2s ease;
          margin-right: 0.25rem;
          color: #6c757d;
        }
        .star-input:hover {
          transform: scale(1.1);
        }
        .star-input.selected,
        .star-input.text-warning {
          color: #F6C84E !important;
        }
        .user-review {
          border-left: 3px solid #10b981;
        }
        .review-meta {
          margin: 0.5rem 0;
        }
        .goal-achieved {
          margin-top: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 4px;
          border-left: 3px solid #10b981;
        }
        .write-review-section {
          text-align: center;
        }
        .rating-text {
          font-weight: 600;
          color: #F6C84E;
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  };

  // Public API
  window.UserReviews = {
    init,
    showReviewModal,
    loadUserReviews,
    getCurrentUser: () => currentUser
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      addReviewStyles();
      setTimeout(init, 500);
    });
  } else {
    addReviewStyles();
    setTimeout(init, 500);
  }

  console.log('User Reviews System loaded');
})();
