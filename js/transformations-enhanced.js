/**
 * Enhanced Transformations System
 * Garcia Builder - Client Transformations with Advanced Features
 */

class TransformationsManager {
    constructor() {
        this.currentFilter = 'all';
        this.visibleItems = 6;
        this.totalItems = 0;
        this.modalInstance = null; // Single modal instance
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateStats();
        this.initializeFilters();
        this.enhanceBeforeAfter();
        this.setupModal();
        console.log('🎯 Enhanced Transformations System Initialized');
    }

    bindEvents() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.closest('.filter-btn').dataset.filter;
                this.filterTransformations(filter);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreTransformations();
            });
        }

        // Use event delegation for transformation cards to avoid duplicate listeners
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.transformation-card');
            if (card && !e.target.closest('.btn, .filter-btn, .load-more-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.openTransformationModal(card);
            }
        });

        // Intersection Observer for animations
        this.setupScrollAnimations();
    }

    enhanceBeforeAfter() {
        const cards = document.querySelectorAll('.transformation-card');
        cards.forEach((card) => {
            const slider = card.querySelector('.before-after-slider');
            const beforeImg = slider?.querySelector('.before-img');
            if (!slider || !beforeImg) return;

            beforeImg.loading = 'lazy';
            beforeImg.decoding = 'async';

            if (card.dataset.before) {
                beforeImg.src = card.dataset.before;
            }

            const afterSrc = card.dataset.after;
            if (afterSrc && !slider.querySelector('.after-img')) {
                const afterImg = beforeImg.cloneNode(true);
                afterImg.classList.remove('before-img');
                afterImg.classList.add('after-img');
                afterImg.src = afterSrc;
                afterImg.alt = `${card.dataset.client || 'Client'} after progress`;
                slider.appendChild(afterImg);
            }
        });
    }

    // Animate statistics counter
    animateStats() {
        const stats = document.querySelectorAll('.stat-number[data-count]');

        const animateCounter = (element, target) => {
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 30);
        };

        // Intersection Observer for stats
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.count);
                    animateCounter(entry.target, target);
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.8 });

        stats.forEach(stat => {
            statsObserver.observe(stat);
        });
    }

    // Initialize filter system
    initializeFilters() {
        this.totalItems = document.querySelectorAll('.transformation-item').length;
        this.updateVisibility();
    }

    // Filter transformations by category
    filterTransformations(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.currentFilter = filter;
        this.visibleItems = 6; // Reset visible items

        // Show/hide items based on filter
        const items = document.querySelectorAll('.transformation-item');
        let visibleCount = 0;

        items.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;

            if (shouldShow && visibleCount < this.visibleItems) {
                item.style.display = 'block';
                item.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
                visibleCount++;
            } else if (shouldShow) {
                item.style.display = 'none'; // Hidden but will be shown with "Load More"
            } else {
                item.style.display = 'none';
            }
        });

        this.updateLoadMoreButton();
    }

    // Load more transformations
    loadMoreTransformations() {
        const additionalSection = document.getElementById('additional-transformations');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (additionalSection && additionalSection.style.display === 'none') {
            // Show additional transformations section with proper display
            additionalSection.style.display = 'flex';
            additionalSection.style.flexWrap = 'wrap';

            // Animate each card container (not just the card)
            const additionalCards = additionalSection.querySelectorAll('.transformation-item');
            additionalCards.forEach((cardContainer, index) => {
                const card = cardContainer.querySelector('.transformation-card');
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';

                    setTimeout(() => {
                        card.style.transition = 'all 0.6s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });

            // Update button text and eventually hide it
            loadMoreBtn.innerHTML = '<i class="fas fa-check me-2"></i>All Transformations Loaded';
            loadMoreBtn.disabled = true;

            // Hide button after 2 seconds
            setTimeout(() => {
                loadMoreBtn.style.display = 'none';
            }, 2000);
        }
    }

    // Update load more button visibility
    updateLoadMoreButton() {
        const items = document.querySelectorAll('.transformation-item');
        const filteredItems = Array.from(items).filter(item => {
            const category = item.dataset.category;
            return this.currentFilter === 'all' || category === this.currentFilter;
        });

        const visibleItems = filteredItems.filter(item => item.style.display !== 'none').length;
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (loadMoreBtn) {
            if (visibleItems >= filteredItems.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
                loadMoreBtn.innerHTML = `
                    <i class="fas fa-plus me-2"></i>
                    Load More (${filteredItems.length - visibleItems} remaining)
                `;
            }
        }
    }

    // Setup modal functionality
    setupModal() {
        const modalElement = document.getElementById('transformationModal');
        if (!modalElement) return;

        // Create single modal instance
        this.modalInstance = new bootstrap.Modal(modalElement, {
            keyboard: true,
            backdrop: true,
            focus: true
        });

        // Clean up on modal hide
        modalElement.addEventListener('hidden.bs.modal', () => {
            // Reset modal content if needed
        });
    }

    // Open transformation modal with data
    openTransformationModal(card) {
        this.populateModal(card);
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    // Populate modal with transformation data
    populateModal(card) {
        const clientName = card.dataset.client;
        const story = card.dataset.story;
        const beforeImg = card.dataset.before;
        const afterImg = card.dataset.after;
        const timeline = card.dataset.timeline;

        // Update modal content
        document.getElementById('modalClientName').textContent = clientName + "'s Transformation";
        document.getElementById('modalStory').textContent = story;

        // Create before/after comparison
        const comparison = document.getElementById('modalComparison');
        comparison.innerHTML = `
            <div class="comparison-item">
                <img src="${beforeImg}" alt="Before" class="comparison-img">
                <div class="comparison-label">Before</div>
            </div>
            <div class="comparison-item">
                <img src="${afterImg}" alt="After" class="comparison-img">
                <div class="comparison-label">After</div>
            </div>
        `;

        // Generate stats
        const stats = this.generateModalStats(card);
        document.getElementById('modalStats').innerHTML = stats;
    }

    // Generate stats HTML for modal
    generateModalStats(card) {
        let statsHTML = `<div class="mb-4"><strong><i class="fas fa-clock text-warning me-2"></i>Timeline:</strong> ${card.dataset.timeline}</div>`;

        // Basic transformation stats
        let basicStats = '<div class="row mb-4"><div class="col-12"><h6 class="text-warning mb-3"><i class="fas fa-chart-bar me-2"></i>Transformation Results</h6></div>';

        if (card.dataset.age) {
            basicStats += `<div class="col-6 mb-2"><i class="fas fa-birthday-cake text-warning me-2"></i>Age: ${card.dataset.age}</div>`;
        }
        if (card.dataset.weightLost) {
            basicStats += `<div class="col-6 mb-2"><i class="fas fa-weight text-warning me-2"></i>Weight Lost: ${card.dataset.weightLost}kg</div>`;
        }
        if (card.dataset.bodyFat) {
            basicStats += `<div class="col-6 mb-2"><i class="fas fa-chart-line text-warning me-2"></i>Body Fat: ${card.dataset.bodyFat}</div>`;
        }
        if (card.dataset.muscle) {
            basicStats += `<div class="col-6 mb-2"><i class="fas fa-dumbbell text-warning me-2"></i>Muscle: ${card.dataset.muscle}</div>`;
        }
        basicStats += '</div>';

        // Performance Achievements Section
        let achievementsHTML = '<div class="row mb-4"><div class="col-12"><h6 class="text-warning mb-3"><i class="fas fa-trophy me-2"></i>Performance Achievements</h6></div>';
        let hasAchievements = false;

        // Strength Achievements
        if (card.dataset.squat) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-medal text-gold me-2"></i><strong>Squat:</strong> ${card.dataset.squat}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.deadlift) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-medal text-gold me-2"></i><strong>Deadlift:</strong> ${card.dataset.deadlift}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.bench) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-medal text-gold me-2"></i><strong>Bench Press:</strong> ${card.dataset.bench}</div></div>`;
            hasAchievements = true;
        }

        // Cardio Achievements
        if (card.dataset.marathon) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-running text-primary me-2"></i><strong>Marathon:</strong> ${card.dataset.marathon}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.runTime) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-stopwatch text-primary me-2"></i><strong>5K Time:</strong> ${card.dataset.runTime}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.miles) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-route text-primary me-2"></i><strong>Distance PR:</strong> ${card.dataset.miles}</div></div>`;
            hasAchievements = true;
        }

        // Fitness Achievements
        if (card.dataset.pullUps) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-hand-rock text-success me-2"></i><strong>Pull-ups:</strong> ${card.dataset.pullUps}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.pushUps) {
            achievementsHTML += `<div class="col-6 mb-2"><div class="achievement-item"><i class="fas fa-hand-paper text-success me-2"></i><strong>Push-ups:</strong> ${card.dataset.pushUps}</div></div>`;
            hasAchievements = true;
        }

        achievementsHTML += '</div>';

        // Only add achievements section if there are achievements
        if (!hasAchievements) {
            achievementsHTML = '';
        }

        return basicStats + achievementsHTML;
    }

    // Setup scroll animations
    setupScrollAnimations() {
        const cards = document.querySelectorAll('.transformation-card');

        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                }
            });
        }, { threshold: 0.2 });

        cards.forEach(card => {
            cardObserver.observe(card);
        });
    }

    // Add new transformation (for admin use)
    addTransformation(data) {
        // This method could be used to dynamically add new transformations
        console.log('Adding new transformation:', data);
        // Implementation would create new card HTML and insert it
    }

    // Get transformation statistics
    getStatistics() {
        const items = document.querySelectorAll('.transformation-item');
        const stats = {
            total: items.length,
            categories: {}
        };

        items.forEach(item => {
            const category = item.dataset.category;
            stats.categories[category] = (stats.categories[category] || 0) + 1;
        });

        return stats;
    }
}

// Enhanced CSS animations
const transformationStyles = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.transformation-card {
    animation-fill-mode: both;
}

.stat-item:hover .stat-number {
    animation: pulse 0.6s ease-in-out;
}

.filter-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transformation-overlay {
    animation: float 3s ease-in-out infinite;
}
`;

// Inject enhanced styles
const styleSheet = document.createElement('style');
styleSheet.textContent = transformationStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.transformationsManager = new TransformationsManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransformationsManager;
}
