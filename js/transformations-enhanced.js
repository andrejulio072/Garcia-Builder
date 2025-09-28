/**
 * Enhanced Transformations System
 * Garcia Builder - Client Transformations with Advanced Features
 */

class TransformationsManager {
    constructor() {
        this.currentFilter = 'all';
        this.visibleItems = 6;
        this.totalItems = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateStats();
        this.initializeFilters();
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

        // Transformation cards for modal
        document.querySelectorAll('.transformation-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.openTransformationModal(e.currentTarget);
            });
        });

        // Intersection Observer for animations
        this.setupScrollAnimations();
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
        const items = document.querySelectorAll('.transformation-item');
        const filteredItems = Array.from(items).filter(item => {
            const category = item.dataset.category;
            return this.currentFilter === 'all' || category === this.currentFilter;
        });

        let visibleCount = 0;
        filteredItems.forEach((item, index) => {
            if (item.style.display !== 'none') {
                visibleCount++;
            }
        });

        // Show next 6 items
        const nextItems = filteredItems.slice(visibleCount, visibleCount + 6);
        nextItems.forEach((item, index) => {
            item.style.display = 'block';
            item.style.animation = `fadeInUp 0.6s ease forwards ${index * 0.1}s`;
        });

        this.visibleItems += 6;
        this.updateLoadMoreButton();
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
        const modal = document.getElementById('transformationModal');
        if (!modal) return;

        modal.addEventListener('show.bs.modal', (event) => {
            const card = event.relatedTarget;
            this.populateModal(card);
        });
    }

    // Open transformation modal with data
    openTransformationModal(card) {
        const modal = new bootstrap.Modal(document.getElementById('transformationModal'));
        this.populateModal(card);
        modal.show();
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
        let statsHTML = `<div class="mb-3"><strong>Timeline:</strong> ${card.dataset.timeline}</div>`;
        
        // Add specific stats based on available data
        if (card.dataset.weightLost) {
            statsHTML += `<div class="mb-2"><i class="fas fa-weight text-warning me-2"></i>Weight Lost: ${card.dataset.weightLost} lbs</div>`;
        }
        if (card.dataset.muscleGained) {
            statsHTML += `<div class="mb-2"><i class="fas fa-dumbbell text-warning me-2"></i>Muscle Gained: ${card.dataset.muscleGained} lbs</div>`;
        }
        if (card.dataset.bodyFat) {
            statsHTML += `<div class="mb-2"><i class="fas fa-chart-line text-warning me-2"></i>Body Fat: ${card.dataset.bodyFat}</div>`;
        }
        if (card.dataset.strength) {
            statsHTML += `<div class="mb-2"><i class="fas fa-fist-raised text-warning me-2"></i>Strength Gain: ${card.dataset.strength}</div>`;
        }
        if (card.dataset.deadlift) {
            statsHTML += `<div class="mb-2"><i class="fas fa-weight-hanging text-warning me-2"></i>Deadlift: ${card.dataset.deadlift} lbs</div>`;
        }
        if (card.dataset.squat) {
            statsHTML += `<div class="mb-2"><i class="fas fa-weight-hanging text-warning me-2"></i>Squat: ${card.dataset.squat} lbs</div>`;
        }
        if (card.dataset.marathon) {
            statsHTML += `<div class="mb-2"><i class="fas fa-running text-warning me-2"></i>Marathon Time: ${card.dataset.marathon}</div>`;
        }

        return statsHTML;
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