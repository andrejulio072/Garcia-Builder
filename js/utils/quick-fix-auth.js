/**
 * 🚨 QUICK FIX - Supabase Auth Not Working
 * 
 * Cole este código no console do navegador se window.supabaseClient.auth.getUser() não retornar nada
 */

(async function quickFixSupabaseAuth() {
    console.log('🔧 Quick Fix - Starting diagnostic and repair...\n');

    // Step 1: Check if client exists
    if (!window.supabaseClient) {
        console.error('❌ CRITICAL: window.supabaseClient is not defined!');
        console.log('💡 Solution: Check if supabase.js is loaded correctly');
        console.log('   Try refreshing the page or check browser console for errors');
        return;
    }

    console.log('✅ Client exists');

    // Step 2: Check auth object
    if (!window.supabaseClient.auth) {
        console.error('❌ CRITICAL: auth object missing from client!');
        console.log('💡 Solution: Supabase client may be corrupted');
        console.log('   Try: location.reload()');
        return;
    }

    console.log('✅ Auth object exists');

    // Step 3: Get current session
    console.log('\n📋 Checking current session...');
    const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();

    if (sessionError) {
        console.error('❌ Session error:', sessionError.message);
    } else if (sessionData?.session) {
        console.log('✅ Active session found:', {
            user: sessionData.session.user.email,
            expires: new Date(sessionData.session.expires_at * 1000),
            provider: sessionData.session.user.app_metadata?.provider
        });
    } else {
        console.warn('⚠️ No active session found');
    }

    // Step 4: Get current user
    console.log('\n👤 Checking current user...');
    const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();

    if (userError) {
        console.error('❌ User error:', userError.message);
        
        // Try to fix
        console.log('\n🔧 Attempting to refresh session...');
        const { data: refreshData, error: refreshError } = await window.supabaseClient.auth.refreshSession();
        
        if (refreshError) {
            console.error('❌ Refresh failed:', refreshError.message);
            console.log('\n💡 SOLUTION: Your session is invalid or expired');
            console.log('   1. Clear localStorage and login again:');
            console.log('      localStorage.clear(); location.href = "/pages/auth/login.html"');
        } else {
            console.log('✅ Session refreshed successfully!');
            console.log('   User:', refreshData.user.email);
            console.log('\n🎯 Try running your code again');
        }
    } else if (userData?.user) {
        console.log('✅ User found:', {
            email: userData.user.email,
            id: userData.user.id,
            name: userData.user.user_metadata?.full_name || userData.user.email.split('@')[0],
            provider: userData.user.app_metadata?.provider || 'email'
        });
        console.log('\n🎉 Everything is working correctly!');
    } else {
        console.warn('⚠️ No user found');
        console.log('\n💡 SOLUTION: You need to login');
        console.log('   Go to: /pages/auth/login.html');
    }

    // Step 5: Check localStorage
    console.log('\n💾 Checking localStorage...');
    const authKeys = Object.keys(localStorage).filter(k => 
        k.includes('supabase') || k.includes('sb-') || k.includes('gb_')
    );

    if (authKeys.length === 0) {
        console.warn('⚠️ No auth data in localStorage');
        console.log('💡 This means you are not logged in');
    } else {
        console.log(`✅ Found ${authKeys.length} auth keys:`, authKeys);
        
        // Check for Supabase token
        const tokenKey = authKeys.find(k => k.includes('auth-token'));
        if (tokenKey) {
            try {
                const token = JSON.parse(localStorage.getItem(tokenKey));
                const expiresAt = new Date(token.expires_at * 1000);
                const isExpired = expiresAt < new Date();
                
                console.log('🔑 Token info:', {
                    key: tokenKey,
                    expires: expiresAt,
                    isExpired,
                    user: token.user?.email
                });

                if (isExpired) {
                    console.warn('⚠️ Token is EXPIRED!');
                    console.log('💡 Attempting auto-refresh...');
                    
                    const { error } = await window.supabaseClient.auth.refreshSession();
                    if (error) {
                        console.error('❌ Auto-refresh failed');
                        console.log('💡 Clear localStorage and login again:');
                        console.log('   localStorage.clear(); location.href = "/pages/auth/login.html"');
                    } else {
                        console.log('✅ Token refreshed! Reload the page.');
                    }
                }
            } catch (err) {
                console.error('❌ Could not parse token:', err);
            }
        }
    }

    // Step 6: Sync with gb_current_user
    console.log('\n🔄 Checking gb_current_user sync...');
    const gbUser = localStorage.getItem('gb_current_user');
    
    if (gbUser) {
        try {
            const parsed = JSON.parse(gbUser);
            console.log('✅ gb_current_user found:', parsed.email);
            
            if (userData?.user && parsed.email !== userData.user.email) {
                console.warn('⚠️ MISMATCH: gb_current_user and Supabase user are different!');
                console.log('   gb_current_user:', parsed.email);
                console.log('   Supabase user:', userData.user.email);
                console.log('\n💡 Fixing sync...');
                
                // Update gb_current_user with Supabase data
                const syncedUser = {
                    ...parsed,
                    ...userData.user,
                    email: userData.user.email,
                    full_name: userData.user.user_metadata?.full_name || parsed.full_name,
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('gb_current_user', JSON.stringify(syncedUser));
                console.log('✅ Sync fixed! Reload page to apply changes.');
            }
        } catch (err) {
            console.error('❌ Could not parse gb_current_user:', err);
        }
    } else {
        console.warn('⚠️ No gb_current_user in localStorage');
        
        if (userData?.user) {
            console.log('💡 Creating gb_current_user from Supabase data...');
            const newUser = {
                id: userData.user.id,
                email: userData.user.email,
                full_name: userData.user.user_metadata?.full_name || userData.user.email.split('@')[0],
                name: userData.user.user_metadata?.name || userData.user.email.split('@')[0],
                avatar_url: userData.user.user_metadata?.avatar_url || null,
                lastLogin: new Date().toISOString(),
                registeredAt: userData.user.created_at
            };
            
            localStorage.setItem('gb_current_user', JSON.stringify(newUser));
            console.log('✅ gb_current_user created! Reload page.');
        }
    }

    // Final summary
    console.log('\n📊 ========================================');
    console.log('📊 QUICK FIX SUMMARY');
    console.log('📊 ========================================');
    
    const hasClient = !!window.supabaseClient;
    const hasSession = !!sessionData?.session;
    const hasUser = !!userData?.user;
    const hasLocalStorage = authKeys.length > 0;
    
    console.log('Status:', {
        '✅ Client Initialized': hasClient,
        '✅ Active Session': hasSession,
        '✅ User Authenticated': hasUser,
        '✅ LocalStorage Data': hasLocalStorage
    });

    if (hasClient && hasSession && hasUser) {
        console.log('\n🎉 ALL SYSTEMS GO! Authentication is working.');
        console.log('You can now use:');
        console.log('  const { data } = await window.supabaseClient.auth.getUser();');
        console.log('  console.log(data.user);');
    } else if (hasClient && !hasSession && !hasUser && hasLocalStorage) {
        console.log('\n⚠️ You have localStorage data but no active session.');
        console.log('Your session may have expired.');
        console.log('\n💡 RECOMMENDED ACTION:');
        console.log('  1. Try refreshing the page first');
        console.log('  2. If that doesn\'t work, login again');
    } else if (hasClient && !hasSession && !hasUser && !hasLocalStorage) {
        console.log('\n⚠️ You are not logged in.');
        console.log('\n💡 RECOMMENDED ACTION:');
        console.log('  Go to /pages/auth/login.html and login');
    } else if (!hasClient) {
        console.log('\n❌ CRITICAL: Supabase client not initialized.');
        console.log('\n💡 RECOMMENDED ACTION:');
        console.log('  1. Check browser console for errors');
        console.log('  2. Make sure scripts load in order: env.js → @supabase/supabase-js → supabase.js');
        console.log('  3. Open test-supabase-init.html for detailed diagnostics');
    }

    console.log('\n========================================\n');
})();
