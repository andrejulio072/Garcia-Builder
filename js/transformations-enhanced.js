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
        this.activeCard = null;
        this.init();
    }

    t(key, fallback, vars) {
        try {
            const lang = (window.GB_I18N && typeof window.GB_I18N.getLang === 'function') ? window.GB_I18N.getLang() : 'en';
            const dicts = window.DICTS || {};
            const resolver = (source) => key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, source);
            let value = resolver(dicts[lang]) ?? resolver(dicts.en) ?? fallback;
            if (typeof value === 'string' && vars) {
                value = Object.keys(vars).reduce((acc, varKey) => acc.replace(new RegExp(`\\{${varKey}\\}`, 'g'), vars[varKey]), value);
            }
            return value ?? fallback;
        } catch (error) {
            console.warn('i18n lookup failed for', key, error);
            return fallback;
        }
    }

    init() {
        this.bindEvents();
        this.animateStats();
        this.initializeFilters();
        this.enhanceBeforeAfter();
        this.setupModal();
        document.addEventListener('languageChanged', () => {
            this.updateLoadMoreButton();
            if (this.activeCard && document.body.classList.contains('modal-open')) {
                this.populateModal(this.activeCard);
            }
        });
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

    updateVisibility(animateFromIndex = 0, options = {}) {
        const { skipButtonUpdate = false } = options || {};
        const items = Array.from(document.querySelectorAll('.transformation-item'));
        let rendered = 0;

        items.forEach((item) => {
            const matchesFilter = this.currentFilter === 'all' || item.dataset.category === this.currentFilter;

            if (matchesFilter && rendered < this.visibleItems) {
                const shouldAnimate = rendered >= animateFromIndex;
                item.style.display = 'flex';

                if (shouldAnimate) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(30px)';
                    item.style.transition = 'opacity 0.45s ease, transform 0.45s ease';

                    const animationOrder = Math.max(0, rendered - animateFromIndex);
                    const delay = animationOrder * 80;

                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        });
                    }, delay);
                } else {
                    item.style.opacity = '';
                    item.style.transform = '';
                    item.style.transition = '';
                }

                rendered += 1;
            } else if (matchesFilter) {
                item.style.display = 'none';
                item.style.opacity = '';
                item.style.transform = '';
                item.style.transition = '';
            } else {
                item.style.display = 'none';
                item.style.opacity = '';
                item.style.transform = '';
                item.style.transition = '';
            }
        });

        if (!skipButtonUpdate) {
            this.updateLoadMoreButton();
        }
    }

    renderLoadMoreButton(state, remaining = 0) {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) {
            return;
        }

        if (state === 'hidden') {
            loadMoreBtn.style.display = 'none';
            return;
        }

        loadMoreBtn.style.display = 'inline-block';

        let iconClass = 'fas fa-plus me-2';
        let label = this.t('transformations.loadMore.cta', 'Load More Transformations');

        if (state === 'loaded') {
            iconClass = 'fas fa-check me-2';
            label = this.t('transformations.loadMore.loaded', 'All Transformations Loaded');
            loadMoreBtn.disabled = true;
        } else if (state === 'remaining') {
            iconClass = 'fas fa-plus me-2';
            label = this.t('transformations.loadMore.remaining', 'Load More ({remaining} remaining)', { remaining });
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.disabled = false;
        }

        loadMoreBtn.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>${label}`;
    }

    // Filter transformations by category
    filterTransformations(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentFilter = filter;
        this.visibleItems = 6; // Reset visible items
        this.updateVisibility();
    }

    // Load more transformations
    loadMoreTransformations() {
        const items = Array.from(document.querySelectorAll('.transformation-item'));
        const filteredItems = items.filter(item => this.currentFilter === 'all' || item.dataset.category === this.currentFilter);

        if (!filteredItems.length) {
            this.renderLoadMoreButton('hidden');
            return;
        }

        const previouslyVisible = this.visibleItems;
        const remaining = filteredItems.length - this.visibleItems;

        if (remaining <= 0) {
            this.renderLoadMoreButton('hidden');
            return;
        }

        const willComplete = (this.visibleItems + 4) >= filteredItems.length;

        this.visibleItems = Math.min(this.visibleItems + 4, filteredItems.length);
        this.updateVisibility(previouslyVisible, { skipButtonUpdate: true });

        if (this.visibleItems >= filteredItems.length) {
            this.renderLoadMoreButton('loaded');
            setTimeout(() => this.renderLoadMoreButton('hidden'), 1800);
        }
    }

    // Update load more button visibility
    updateLoadMoreButton() {
        const items = document.querySelectorAll('.transformation-item');
        const filteredItems = Array.from(items).filter(item => {
            const category = item.dataset.category;
            return this.currentFilter === 'all' || category === this.currentFilter;
        });

        const loadMoreBtn = document.getElementById('loadMoreBtn');

        if (!loadMoreBtn) {
            return;
        }

        const visibleItems = filteredItems.filter(item => item.style.display !== 'none').length;

        if (visibleItems >= filteredItems.length) {
            if (filteredItems.length <= this.visibleItems) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-block';
                loadMoreBtn.disabled = true;
                const loaded = this.t('transformations.loadMore.loaded', 'All Transformations Loaded');
                loadMoreBtn.innerHTML = `<i class="fas fa-check me-2"></i>${loaded}`;
            }
        } else {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.disabled = false;
            const remaining = filteredItems.length - visibleItems;
            const label = this.t('transformations.loadMore.remaining', 'Load More ({remaining} remaining)', { remaining });
            loadMoreBtn.innerHTML = `
                <i class="fas fa-plus me-2"></i>
                ${label}
            `;
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

    // Update modal content (i18n aware)
    const titleSuffix = this.t('transformations.modal.titleSuffix', "'s Transformation");
    document.getElementById('modalClientName').textContent = `${clientName}${titleSuffix}`;
    document.getElementById('modalStory').textContent = story;

        // Create before/after comparison
        const comparison = document.getElementById('modalComparison');
        const beforeLabel = this.t('transformations.modal.before', 'Before');
        const afterLabel = this.t('transformations.modal.after', 'After');
        comparison.innerHTML = `
            <div class="comparison-item">
                <img src="${beforeImg}" alt="${beforeLabel}" class="comparison-img">
                <div class="comparison-label">${beforeLabel}</div>
            </div>
            <div class="comparison-item">
                <img src="${afterImg}" alt="${afterLabel}" class="comparison-img">
                <div class="comparison-label">${afterLabel}</div>
            </div>
        `;

        // Generate stats
        const stats = this.generateModalStats(card);
        document.getElementById('modalStats').innerHTML = stats;
    }

    // Generate stats HTML for modal
    generateModalStats(card) {
    const timelineLabel = this.t('transformations.modal.timeline', 'Timeline');
    let statsHTML = `<div class=\"mb-4\"><strong><i class=\"fas fa-clock text-warning me-2\"></i>${timelineLabel}:</strong> ${card.dataset.timeline}</div>`;

        // Basic transformation stats
    const resultsTitle = this.t('transformations.modal.results', 'Transformation Results');
    let basicStats = `<div class=\"row mb-4\"><div class=\"col-12\"><h6 class=\"text-warning mb-3\"><i class=\"fas fa-chart-bar me-2\"></i>${resultsTitle}</h6></div>`;

        const ageLabel = this.t('transformations.modal.age', 'Age');
        const weightLostLabel = this.t('transformations.modal.weightLost', 'Weight Lost');
        const bodyFatLabel = this.t('transformations.modal.bodyFat', 'Body Fat');
        const muscleLabel = this.t('transformations.modal.muscle', 'Muscle');
        if (card.dataset.age) {
            basicStats += `<div class=\"col-6 mb-2\"><i class=\"fas fa-birthday-cake text-warning me-2\"></i>${ageLabel}: ${card.dataset.age}</div>`;
        }
        if (card.dataset.weightLost) {
            basicStats += `<div class=\"col-6 mb-2\"><i class=\"fas fa-weight text-warning me-2\"></i>${weightLostLabel}: ${card.dataset.weightLost}kg</div>`;
        }
        if (card.dataset.bodyFat) {
            basicStats += `<div class=\"col-6 mb-2\"><i class=\"fas fa-chart-line text-warning me-2\"></i>${bodyFatLabel}: ${card.dataset.bodyFat}</div>`;
        }
        if (card.dataset.muscle) {
            basicStats += `<div class=\"col-6 mb-2\"><i class=\"fas fa-dumbbell text-warning me-2\"></i>${muscleLabel}: ${card.dataset.muscle}</div>`;
        }
        basicStats += '</div>';

        // Performance Achievements Section
    const achievementsTitle = this.t('transformations.modal.achievements', 'Performance Achievements');
    let achievementsHTML = `<div class=\"row mb-4\"><div class=\"col-12\"><h6 class=\"text-warning mb-3\"><i class=\"fas fa-trophy me-2\"></i>${achievementsTitle}</h6></div>`;
        let hasAchievements = false;

        // Strength Achievements
        const squatLabel = this.t('transformations.modal.squat', 'Squat');
        const deadliftLabel = this.t('transformations.modal.deadlift', 'Deadlift');
        const benchLabel = this.t('transformations.modal.bench', 'Bench Press');
        if (card.dataset.squat) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-medal text-gold me-2\"></i><strong>${squatLabel}:</strong> ${card.dataset.squat}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.deadlift) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-medal text-gold me-2\"></i><strong>${deadliftLabel}:</strong> ${card.dataset.deadlift}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.bench) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-medal text-gold me-2\"></i><strong>${benchLabel}:</strong> ${card.dataset.bench}</div></div>`;
            hasAchievements = true;
        }

        // Cardio Achievements
        const marathonLabel = this.t('transformations.modal.marathon', 'Marathon');
        const runTimeLabel = this.t('transformations.modal.runTime', '5K Time');
        const milesLabel = this.t('transformations.modal.miles', 'Distance PR');
        if (card.dataset.marathon) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-running text-primary me-2\"></i><strong>${marathonLabel}:</strong> ${card.dataset.marathon}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.runTime) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-stopwatch text-primary me-2\"></i><strong>${runTimeLabel}:</strong> ${card.dataset.runTime}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.miles) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-route text-primary me-2\"></i><strong>${milesLabel}:</strong> ${card.dataset.miles}</div></div>`;
            hasAchievements = true;
        }

        // Fitness Achievements
        const pullUpsLabel = this.t('transformations.modal.pullUps', 'Pull-ups');
        const pushUpsLabel = this.t('transformations.modal.pushUps', 'Push-ups');
        if (card.dataset.pullUps) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-hand-rock text-success me-2\"></i><strong>${pullUpsLabel}:</strong> ${card.dataset.pullUps}</div></div>`;
            hasAchievements = true;
        }
        if (card.dataset.pushUps) {
            achievementsHTML += `<div class=\"col-6 mb-2\"><div class=\"achievement-item\"><i class=\"fas fa-hand-paper text-success me-2\"></i><strong>${pushUpsLabel}:</strong> ${card.dataset.pushUps}</div></div>`;
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
