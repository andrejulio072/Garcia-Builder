/**
 * GARCIA BUILDER - EVENT TRACKING MODULE
 * Version: 1.0 Professional
 * Centralized event tracking for analytics
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    if (window.__EVENT_TRACKING_INITIALIZED__) {
        if (window.DEBUG_ANALYTICS) {
            console.warn('[EventTracking] Initialization skipped (already loaded).');
        }
        return;
    }
    window.__EVENT_TRACKING_INITIALIZED__ = true;

    // Initialize data layer
    window.dataLayer = window.dataLayer || [];

    /**
     * Push unified analytics events to dataLayer and GA4 (gtag)
     * @param {string} eventName - Event name to push
     * @param {object} params - Additional parameters for the event
     */
    function triggerAnalyticsEvent(eventName, params) {
        if (!eventName) {
            return;
        }

        const extras = sanitizeParams(params);
        const payload = Object.assign({
            event: eventName,
            event_timestamp: new Date().toISOString(),
            page_location: extras.page_location || window.location.href
        }, extras);

        try {
            window.dataLayer.push(payload);
        } catch (err) {
            console.warn('[EventTracking] Failed to push event to dataLayer', err);
        }

        if (typeof window.gtag === 'function') {
            const gtagPayload = Object.assign({}, extras);
            if (!gtagPayload.page_location) {
                gtagPayload.page_location = window.location.href;
            }

            try {
                window.gtag('event', eventName, gtagPayload);
            } catch (err) {
                console.warn('[EventTracking] gtag push failed', eventName, err);
            }
        }
    }

    /**
     * Remove undefined / null parameters
     * @param {object} params
     * @returns {object}
     */
    function sanitizeParams(params) {
        const source = params || {};
        const clean = {};
        Object.keys(source).forEach(function(key) {
            const value = source[key];
            if (value !== undefined && value !== null && value !== '') {
                clean[key] = value;
            }
        });
        return clean;
    }

    /**
     * Safe trimming helper for CTA text
     * @param {Element} el
     * @returns {string|undefined}
     */
    function getNormalizedText(el) {
        if (!el || typeof el.textContent !== 'string') {
            return undefined;
        }
        return el.textContent.replace(/\s+/g, ' ').trim();
    }

    /**
     * Derive a generic page context label
     * @returns {string}
     */
    function getPageContext() {
        const bodyContext = document.body ? (document.body.getAttribute('data-analytics-context') || document.body.dataset?.analyticsContext) : '';
        if (bodyContext) {
            return bodyContext;
        }
        const title = document.title || '';
        if (title) {
            return title.substring(0, 80);
        }
        return window.location.pathname || 'website';
    }

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
    window.trackCoachingInquiry = function(type, source, metadata) {
        type = type || 'general';
        source = source || 'website';
        metadata = metadata || {};

        const { value, currency } = metadata;
        const eventValue = typeof value === 'number' ? value : 50.00;
        const eventCurrency = currency || 'EUR';
        const additional = sanitizeParams(Object.assign({}, metadata));
        delete additional.value;
        delete additional.currency;

        const eventMetadata = Object.assign({
            inquiry_type: type,
            inquiry_source: source,
            value: eventValue,
            currency: eventCurrency
        }, additional);

        triggerAnalyticsEvent('coaching_inquiry', eventMetadata);

        // Facebook Pixel tracking
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                value: eventValue,
                currency: eventCurrency,
                content_category: 'coaching_inquiry'
            });
        }

        // Google Ads conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'AW-17627402053/inquiry',
                value: eventValue,
                currency: eventCurrency
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
            const actionable = target.closest('a, button');
            const pageContext = getPageContext();

            if (actionable) {
                if (isWhatsAppLink(actionable)) {
                    const ctaText = getNormalizedText(actionable);
                    triggerAnalyticsEvent('whatsapp_click', {
                        cta_text: ctaText,
                        link_url: actionable.href,
                        engagement_location: pageContext
                    });

                    trackCoachingInquiry('whatsapp', pageContext, {
                        channel: 'whatsapp',
                        cta_text: ctaText,
                        value: 0
                    });
                } else if (isBookConsultationLink(actionable)) {
                    const ctaText = getNormalizedText(actionable);
                    triggerAnalyticsEvent('book_call_click', {
                        cta_text: ctaText,
                        link_url: actionable.href,
                        engagement_location: pageContext
                    });

                    trackCoachingInquiry('cta_click', pageContext, {
                        conversion_goal: 'book_free_consultation',
                        cta_text: ctaText,
                        value: 0
                    });
                } else if (isGenericCtaButton(actionable)) {
                    const ctaText = getNormalizedText(actionable);
                    trackCoachingInquiry('cta_click', pageContext, {
                        cta_text: ctaText,
                        value: 0
                    });
                }
            }

            // Track blog article clicks
            const blogLink = target.classList.contains('blog-link') ? target : target.closest('.blog-link');
            if (blogLink) {
                const articleTitle = blogLink.getAttribute('data-article') || blogLink.textContent.trim();
                const articleUrl = blogLink.href;
                trackBlogClick(articleTitle, articleUrl);
            }

            // Track pricing plan clicks
            const pricingButton = actionable && actionable.classList.contains('pricing-cta') ? actionable : target.closest('.pricing-cta');
            if (pricingButton) {
                const planName = pricingButton.getAttribute('data-plan') || pricingButton.dataset?.plan || 'unknown';
                dataLayer.push({
                    event: 'pricing_plan_click',
                    plan_name: planName,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }

    /**
     * Determine if element is a Calendly consultation CTA
     * @param {Element} element
     * @returns {boolean}
     */
    function isBookConsultationLink(element) {
        if (!element) {
            return false;
        }
        if (element.dataset && element.dataset.analytics === 'book-consultation') {
            return true;
        }
        const href = (element.getAttribute('href') || '').toLowerCase();
        return href.includes('calendly.com') && (href.includes('consult') || href.includes('free'));
    }

    /**
     * Determine if element is a WhatsApp contact link
     * @param {Element} element
     * @returns {boolean}
     */
    function isWhatsAppLink(element) {
        if (!element) {
            return false;
        }
        const href = (element.getAttribute('href') || '').toLowerCase();
        return href.includes('wa.me') || href.includes('api.whatsapp.com');
    }

    /**
     * Determine if element is a generic CTA button worth tracking
     * @param {Element} element
     * @returns {boolean}
     */
    function isGenericCtaButton(element) {
        if (!element || !element.classList) {
            return false;
        }
        const textMatch = getNormalizedText(element) || '';
        return element.classList.contains('btn-primary') ||
               element.classList.contains('btn-gold') ||
               textMatch.includes('Começar') ||
               textMatch.includes('Start');
    }

    /**
     * Attach lead form submission tracking to qualifying forms
     */
    function initLeadFormTracking() {
        const SELECTOR = 'form.hero-lead-form, form[data-attr-track], form[data-track-lead="true"], form.lead-magnet-form, form#contact-form';

        function bindForm(form) {
            if (!form || form.dataset.analyticsBound === 'true') {
                return;
            }

            form.dataset.analyticsBound = 'true';

            form.addEventListener('submit', function() {
                if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
                    return;
                }

                const source = form.getAttribute('data-source') || form.dataset.source || getPageContext();
                const eventParams = sanitizeParams({
                    form_id: form.id,
                    form_name: form.getAttribute('name'),
                    form_source: source,
                    engagement_location: getPageContext()
                });

                triggerAnalyticsEvent('lead_submit', eventParams);
                trackCoachingInquiry('lead_form', source, Object.assign({
                    value: 0
                }, eventParams));
            });
        }

        document.querySelectorAll(SELECTOR).forEach(bindForm);

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (!(node instanceof Element)) {
                        return;
                    }
                    if (node.matches && node.matches(SELECTOR)) {
                        bindForm(node);
                    }
                    node.querySelectorAll?.(SELECTOR).forEach(bindForm);
                });
            });
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
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
        initLeadFormTracking();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

})();

