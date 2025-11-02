/**
 * 🛡️ LOOP PREVENTION GUARD
 * Prevents infinite redirect loops on login page
 */

(function preventLoginLoop() {
    // Only run on login/register pages
    const isAuthPage = window.location.pathname.includes('login.html') || 
                       window.location.pathname.includes('register.html');
    
    if (!isAuthPage) {
        return;
    }

    // Check if running on file:// protocol
    const isFileProtocol = window.location.protocol === 'file:';
    
    if (isFileProtocol) {
        console.log('📁 Running on file:// protocol');
        console.log('🛡️ Loop Prevention Guard Active (file:// mode)');
        
        // For file:// protocol, always clear stale auth data on login page
        const gbUser = localStorage.getItem('gb_current_user');
        if (gbUser) {
            console.warn('⚠️ Found gb_current_user on file:// login page');
            console.log('📁 Clearing stale data to prevent confusion...');
            
            try {
                const parsed = JSON.parse(gbUser);
                console.log('Previous user:', parsed.email);
            } catch (e) {
                console.error('Could not parse user data');
            }
            
            // Clear to force fresh login
            localStorage.removeItem('gb_current_user');
            
            // Keep remember_user for convenience
            const rememberedEmail = localStorage.getItem('gb_remember_user');
            if (rememberedEmail) {
                console.log('✅ Keeping remembered email:', rememberedEmail);
            }
        }
        
        // No need for complex loop detection on file://
        // The checkAuthStatus already handles it
        return;
    }

    console.log('🛡️ Login Loop Prevention Guard Active');

    // Track redirects to detect loops (only for http/https)
    const LOOP_DETECTION_KEY = 'gb_redirect_loop_detection';
    const MAX_REDIRECTS = 3;
    const RESET_INTERVAL = 5000; // 5 seconds

    function getLoopData() {
        try {
            const data = sessionStorage.getItem(LOOP_DETECTION_KEY);
            return data ? JSON.parse(data) : { count: 0, lastTime: 0 };
        } catch {
            return { count: 0, lastTime: 0 };
        }
    }

    function incrementLoopCounter() {
        const now = Date.now();
        const data = getLoopData();

        // Reset counter if enough time has passed
        if (now - data.lastTime > RESET_INTERVAL) {
            data.count = 1;
        } else {
            data.count++;
        }

        data.lastTime = now;
        sessionStorage.setItem(LOOP_DETECTION_KEY, JSON.stringify(data));
        
        return data.count;
    }

    function resetLoopCounter() {
        sessionStorage.removeItem(LOOP_DETECTION_KEY);
    }

    function isInLoop() {
        const data = getLoopData();
        const now = Date.now();
        
        // If we've been redirected multiple times in a short period
        if (data.count >= MAX_REDIRECTS && (now - data.lastTime) < RESET_INTERVAL) {
            return true;
        }
        
        return false;
    }

    function handleLoopDetected() {
        console.error('🚨 REDIRECT LOOP DETECTED! Breaking loop...');
        
        // Clear auth data that might be causing the loop
        const gbUser = localStorage.getItem('gb_current_user');
        
        if (gbUser) {
            console.warn('⚠️ Found gb_current_user in localStorage');
            
            try {
                const parsed = JSON.parse(gbUser);
                console.log('User data:', {
                    email: parsed.email,
                    name: parsed.name || parsed.full_name,
                    hasId: !!parsed.id
                });
            } catch (e) {
                console.error('Could not parse user data');
            }

            // Ask user what to do
            const shouldClear = confirm(
                '⚠️ REDIRECT LOOP DETECTED!\n\n' +
                'The page is stuck in a redirect loop.\n' +
                'This usually means you have cached login data but no valid session.\n\n' +
                'Click OK to clear the cached data and stay on login page.\n' +
                'Click Cancel to keep trying (not recommended).'
            );

            if (shouldClear) {
                console.log('🧹 Clearing auth data to break loop...');
                localStorage.removeItem('gb_current_user');
                localStorage.removeItem('gb_remember_user');
                
                // Clear Supabase sessions too
                const supabaseKeys = Object.keys(localStorage)
                    .filter(k => k.includes('sb-') || k.includes('supabase'));
                
                supabaseKeys.forEach(key => {
                    console.log('Removing:', key);
                    localStorage.removeItem(key);
                });

                resetLoopCounter();
                
                alert('✅ Auth data cleared. You can now login again.');
                
                // Reload page
                window.location.href = window.location.pathname;
            } else {
                console.log('User chose to keep trying...');
                resetLoopCounter();
            }
        } else {
            console.log('No gb_current_user found, but loop detected anyway');
            resetLoopCounter();
        }
    }

    // Check if we're already in a loop
    if (isInLoop()) {
        handleLoopDetected();
        return;
    }

    // Increment counter on page load
    const redirectCount = incrementLoopCounter();
    console.log(`🔄 Redirect count: ${redirectCount}/${MAX_REDIRECTS}`);

    // Monitor for navigation attempts (potential redirects)
    let navigationAttempts = 0;
    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;

    window.location.assign = function(...args) {
        navigationAttempts++;
        console.log('🔄 Navigation attempt via assign():', args[0]);
        
        if (navigationAttempts > 2) {
            console.error('🚨 Too many navigation attempts!');
            handleLoopDetected();
            return;
        }
        
        return originalAssign.apply(this, args);
    };

    window.location.replace = function(...args) {
        navigationAttempts++;
        console.log('🔄 Navigation attempt via replace():', args[0]);
        
        if (navigationAttempts > 2) {
            console.error('🚨 Too many navigation attempts!');
            handleLoopDetected();
            return;
        }
        
        return originalReplace.apply(this, args);
    };

    // Monitor href changes
    let hrefSetCount = 0;
    Object.defineProperty(window.location, 'href', {
        set: function(url) {
            hrefSetCount++;
            console.log('🔄 Navigation attempt via href:', url);
            
            if (hrefSetCount > 2) {
                console.error('🚨 Too many href changes!');
                handleLoopDetected();
                return;
            }
            
            // Call original setter
            Object.getOwnPropertyDescriptor(window.Location.prototype, 'href')
                .set.call(this, url);
        },
        get: function() {
            return Object.getOwnPropertyDescriptor(window.Location.prototype, 'href')
                .get.call(this);
        }
    });

    // Reset counter after successful page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('✅ Page loaded successfully, resetting redirect counter');
            resetLoopCounter();
        }, 2000);
    });

    // Allow manual reset via console
    window.resetLoginLoop = resetLoopCounter;
    console.log('💡 Tip: Run window.resetLoginLoop() in console to reset loop detection');

})();
