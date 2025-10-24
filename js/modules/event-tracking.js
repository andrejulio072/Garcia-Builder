/**
 * GARCIA BUILDER - EVENT TRACKING MODULE
 * Version: 1.0 Professional
 * Centralized event tracking for analytics
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    // Initialize data layer
    window.dataLayer = window.dataLayer || [];

    /**
     * Track page view event
     */
    function trackPageView() {
        dataLayer.push({
            event: 'page_view',
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Track coaching inquiry event
     * @param {string} type - Type of inquiry (general, whatsapp, cta_click)
     * @param {string} source - Source of inquiry (website, homepage, etc)
     */
    window.trackCoachingInquiry = function(type, source) {
        type = type || 'general';
        source = source || 'website';

        // Google Analytics 4 event
        dataLayer.push({
            event: 'coaching_inquiry',
            inquiry_type: type,
            inquiry_source: source,
            value: 50.00,
            currency: 'EUR',
            timestamp: new Date().toISOString()
        });

        // Facebook Pixel tracking
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                value: 50.00,
                currency: 'EUR',
                content_category: 'coaching_inquiry'
            });
        }

        // Google Ads conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'AW-17627402053/inquiry',
                value: 50.00,
                currency: 'EUR'
            });
        }
    };

    /**
     * Track blog article click
     * @param {string} articleTitle - Title of the article
     * @param {string} articleUrl - URL of the article
     */
    function trackBlogClick(articleTitle, articleUrl) {
        dataLayer.push({
            event: 'blog_click',
            article_title: articleTitle,
            article_url: articleUrl,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Initialize click event tracking
     */
    function initClickTracking() {
        document.addEventListener('click', function(e) {
            const target = e.target;

            // Track WhatsApp clicks
            if (target.href && target.href.includes('wa.me')) {
                trackCoachingInquiry('whatsapp', 'homepage');
            }

            // Track CTA button clicks
            if (target.classList.contains('btn-primary') || 
                target.classList.contains('btn-gold') ||
                target.textContent.includes('Começar') ||
                target.textContent.includes('Start')) {
                trackCoachingInquiry('cta_click', 'homepage');
            }

            // Track blog article clicks
            const blogLink = target.classList.contains('blog-link') ? target : target.closest('.blog-link');
            if (blogLink) {
                const articleTitle = blogLink.getAttribute('data-article') || blogLink.textContent.trim();
                const articleUrl = blogLink.href;
                trackBlogClick(articleTitle, articleUrl);
            }

            // Track pricing plan clicks
            if (target.classList.contains('pricing-cta') || target.closest('.pricing-cta')) {
                const planName = target.getAttribute('data-plan') || 'unknown';
                dataLayer.push({
                    event: 'pricing_plan_click',
                    plan_name: planName,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Track scroll depth
     */
    function initScrollTracking() {
        let scrollDepths = [25, 50, 75, 100];
        let triggeredDepths = new Set();

        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !triggeredDepths.has(depth)) {
                    triggeredDepths.add(depth);
                    dataLayer.push({
                        event: 'scroll_depth',
                        scroll_depth: depth,
                        page_location: window.location.href
                    });
                }
            });
        });
    }

    /**
     * Track time on page
     */
    function initTimeTracking() {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', function() {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            
            if (navigator.sendBeacon && dataLayer) {
                const data = JSON.stringify({
                    event: 'time_on_page',
                    duration_seconds: timeOnPage,
                    page_location: window.location.href
                });
                navigator.sendBeacon('/analytics', data);
            }
        });
    }

    /**
     * Initialize all tracking
     */
    function initTracking() {
        trackPageView();
        initClickTracking();
        initScrollTracking();
        initTimeTracking();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

})();
