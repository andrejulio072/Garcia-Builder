/**
 * Scroll Effects Module
 * 
 * Handles scroll-triggered animations:
 * - Stats counter animation with Intersection Observer
 * - Feature card reveal effects with stagger
 * - Smooth scroll-based interactions
 * 
 * @module scroll-effects
 */

(function() {
    'use strict';

    /**
     * Animates a counter element from 0 to target value
     * 
     * @param {HTMLElement} element - The element to animate
     * @param {number} target - The target number to count to
     * @param {number} duration - Animation duration in milliseconds
     */
    function animateCounter(element, target, duration = 2000) {
        if (!element) return;

        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                // Format final number
                element.textContent = target >= 1000 
                    ? Math.floor(target).toLocaleString() + '+' 
                    : target.toFixed(1);
                clearInterval(timer);
            } else {
                // Format intermediate number
                element.textContent = target >= 1000 
                    ? Math.floor(current).toLocaleString() + '+' 
                    : current.toFixed(1);
            }
        }, 16);
    }

    /**
     * Initialize stats counter animation
     * Triggers when stats section enters viewport
     */
    function initStatsAnimation() {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    // Mark as animated to prevent re-triggering
                    entry.target.classList.add('animated');
                    
                    // Find all counter elements
                    const statElements = entry.target.querySelectorAll('[data-count]');

                    // Animate each counter
                    statElements.forEach(el => {
                        const targetValue = parseFloat(el.getAttribute('data-count'));
                        animateCounter(el, targetValue);
                    });

                    // Stop observing after animation starts
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.3, // Trigger when 30% visible
            rootMargin: '0px' 
        });

        // Find and observe stats section
        const statsSection = document.querySelector('[data-count]')?.closest('section');
        if (statsSection) {
            statsObserver.observe(statsSection);
        }
    }

    /**
     * Initialize feature card reveal animation
     * Cards fade in and slide up with stagger effect
     */
    function initCardRevealAnimation() {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
                    // Stagger effect: delay each card by 100ms
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.classList.add('revealed');
                    }, index * 100);
                }
            });
        }, { 
            threshold: 0.1, // Trigger when 10% visible
            rootMargin: '0px 0px -50px 0px' // Start slightly before entering viewport
        });

        // Find all feature cards
        const featureCards = document.querySelectorAll('.card.feature');
        
        if (featureCards.length > 0) {
            featureCards.forEach(card => {
                // Set initial hidden state
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Start observing
                revealObserver.observe(card);
            });
        }
    }

    /**
     * Initialize all scroll effects
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initStatsAnimation();
                initCardRevealAnimation();
            });
        } else {
            // DOM already loaded
            initStatsAnimation();
            initCardRevealAnimation();
        }
    }

    // Auto-initialize
    init();

})();
