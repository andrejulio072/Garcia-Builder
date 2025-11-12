/**
 * GARCIA BUILDER - VIDEO PLAYER MODULE
 * Version: 1.0 Professional
 * Lazy-loaded YouTube video player with analytics
 * Last Updated: October 25, 2025
 */

(function() {
    'use strict';

    const AUTOPLAY_DEFAULT = 'scroll';
    let intersectionObserver = null;

    function ensureObserver() {
        if (intersectionObserver || typeof window === 'undefined') {
            return intersectionObserver;
        }

        if (!('IntersectionObserver' in window)) {
            return null;
        }

        intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                const target = entry.target;
                if (typeof target._gbActivateVideo === 'function') {
                    target._gbActivateVideo();
                }
                intersectionObserver.unobserve(target);
            });
        }, {
            threshold: 0.55,
            rootMargin: '0px 0px -10% 0px'
        });

        return intersectionObserver;
    }

    function elementMostlyVisible(el, fraction) {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        if (rect.bottom <= 0 || rect.right <= 0 || rect.top >= viewportHeight || rect.left >= viewportWidth) {
            return false;
        }

        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
        const visibleArea = Math.max(0, visibleHeight) * Math.max(0, visibleWidth);
        const elementArea = Math.max(rect.width * rect.height, 1);

        return visibleArea / elementArea >= fraction;
    }

    function initVideoPlayers() {
        const containers = document.querySelectorAll('[data-video-id]');
        if (!containers.length) {
            return;
        }

        const observer = ensureObserver();

        containers.forEach((container) => {
            if (!container || container.dataset.videoInit === '1') {
                return;
            }

            container.dataset.videoInit = '1';

            const videoId = container.getAttribute('data-video-id');
            if (!videoId) {
                return;
            }

            const playButton = container.querySelector('.gb-video-play');
            const analyticsLabel = container.getAttribute('data-analytics-label') || 'homepage_demo';
            const analyticsLocation = container.getAttribute('data-analytics-location') || 'homepage_hero';
            const iframeTitle = container.getAttribute('data-video-title') || 'Garcia Builder Method';
            const shouldLoop = container.getAttribute('data-loop') !== 'false';
            const shouldMute = container.getAttribute('data-mute') !== 'false';
            const showControls = container.getAttribute('data-controls') !== 'false';
            const autoplayMode = (container.getAttribute('data-autoplay') || AUTOPLAY_DEFAULT).toLowerCase();

            let fallbackHandler = null;

            function activateVideo() {
                if (container.dataset.videoActive === '1') {
                    return;
                }

                container.dataset.videoActive = '1';
                container.classList.add('gb-video-playing');

                if (observer) {
                    observer.unobserve(container);
                }

                if (fallbackHandler) {
                    window.removeEventListener('scroll', fallbackHandler, true);
                    window.removeEventListener('resize', fallbackHandler, true);
                    fallbackHandler = null;
                }

                const iframe = document.createElement('iframe');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('title', iframeTitle);
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');

                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';

                const params = new URLSearchParams({
                    autoplay: '1',
                    rel: '0',
                    modestbranding: '1',
                    playsinline: '1'
                });

                if (shouldMute) {
                    params.set('mute', '1');
                }

                if (!showControls) {
                    params.set('controls', '0');
                }

                if (shouldLoop) {
                    params.set('loop', '1');
                    params.set('playlist', videoId);
                }

                iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;

                container.innerHTML = '';
                container.appendChild(iframe);

                trackVideoPlay(videoId, analyticsLabel, analyticsLocation);
                delete container._gbActivateVideo;
            }

            container._gbActivateVideo = activateVideo;

            function handleKeyPress(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activateVideo();
                }
            }

            if (playButton) {
                playButton.addEventListener('click', activateVideo);
            }

            container.addEventListener('click', function(event) {
                if (event.target === playButton || (playButton && playButton.contains(event.target))) {
                    return;
                }
                activateVideo();
            });

            container.addEventListener('keydown', handleKeyPress);

            const prefersManual = autoplayMode === 'manual' || autoplayMode === 'none';
            if (!prefersManual) {
                if (observer) {
                    observer.observe(container);
                } else {
                    // Fallback: if IntersectionObserver unavailable, trigger when mostly visible
                    const runFallbackAutoplay = () => {
                        if (container.dataset.videoActive === '1') {
                            window.removeEventListener('scroll', runFallbackAutoplay, true);
                            window.removeEventListener('resize', runFallbackAutoplay, true);
                            fallbackHandler = null;
                            return;
                        }
                        if (elementMostlyVisible(container, 0.6)) {
                            activateVideo();
                            window.removeEventListener('scroll', runFallbackAutoplay, true);
                            window.removeEventListener('resize', runFallbackAutoplay, true);
                            fallbackHandler = null;
                        }
                    };
                    window.addEventListener('scroll', runFallbackAutoplay, true);
                    window.addEventListener('resize', runFallbackAutoplay, true);
                    fallbackHandler = runFallbackAutoplay;
                    // Attempt initial check in case already visible
                    setTimeout(runFallbackAutoplay, 250);
                }
            }
        });
    }

    function trackVideoPlay(videoId, label, location) {
        try {
            if (window.gtag) {
                gtag('event', 'play_video', {
                    event_category: 'engagement',
                    event_label: label,
                    video_id: videoId
                });
            }

            if (window.dataLayer) {
                window.dataLayer.push({
                    event: 'video_play',
                    video_id: videoId,
                    video_location: location
                });
            }
        } catch (e) {
            console.warn('[Video Player] Tracking failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers);
    } else {
        initVideoPlayers();
    }

})();
