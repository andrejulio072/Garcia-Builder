/**
 * GARCIA BUILDER - CONVERSION TRACKING
 * Version: 2.0 Professional
 * Google Ads conversion tracking functions
 * Last Updated: October 24, 2025
 */

(function() {
    'use strict';

    const DEFAULT_AW_CONVERSION_LABEL = 'mdOMCOTV3acbEMWes9VB';

    /**
     * Google Ads Conversion Tracking Function
     * @param {string} url - Optional URL to redirect after conversion
     * @returns {boolean} - Always returns false to prevent default link behavior
     */
    window.gtag_report_conversion = function(url) {
        const callback = function () {
            if (typeof(url) !== 'undefined') {
                window.location = url;
            }
        };
        
        // Send conversion event to Google Ads
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': 'AW-17627402053/mdOMCOTV3acbEMWes9VB',
                'value': 1.0,
                'currency': 'GBP',
                'event_callback': callback
            });
        } else {
            console.warn('[Conversion Tracking] gtag is not defined');
            callback(); // Execute callback even if gtag fails
        }
        
        return false;
    };

    /**
     * Facebook Pixel ID
     * Used by pixel-init.js for tracking
     */
    window.FB_PIXEL_ID = '1102565141856929';

    /**
     * Google Ads Conversion Label
     * Set this value to enable purchase conversion tracking on success.html
     * Leave empty to prevent invalid events
     */
    if (!window.AW_CONVERSION_LABEL) {
        window.AW_CONVERSION_LABEL = DEFAULT_AW_CONVERSION_LABEL;
    }

})();
