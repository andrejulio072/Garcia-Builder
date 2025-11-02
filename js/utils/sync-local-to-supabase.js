/**
 * 🔄 SYNC LOCAL TO SUPABASE
 * 
 * Sincroniza usuários que existem no localStorage (gb_current_user) 
 * mas não têm sessão ativa no Supabase
 */

(async function syncLocalToSupabase() {
    console.log('🔄 ========================================');
    console.log('🔄 SYNC LOCAL TO SUPABASE');
    console.log('🔄 ========================================\n');

    // 1. Check if we have local user data
    const gbUserStr = localStorage.getItem('gb_current_user');
    if (!gbUserStr) {
        console.warn('⚠️ No gb_current_user found in localStorage');
        console.log('💡 You need to login first');
        return;
    }

    let gbUser;
    try {
        gbUser = JSON.parse(gbUserStr);
        console.log('✅ Found local user:', gbUser.email);
    } catch (err) {
        console.error('❌ Could not parse gb_current_user:', err);
        return;
    }

    // 2. Check if Supabase client is available
    if (!window.supabaseClient) {
        console.warn('⚠️ Supabase client not available');
        console.log('💡 Waiting for client...');
        
        if (window.waitForSupabaseClient) {
            try {
                await window.waitForSupabaseClient();
                console.log('✅ Client ready');
            } catch (err) {
                console.error('❌ Client initialization failed:', err);
                return;
            }
        } else {
            console.error('❌ Cannot wait for client - function not available');
            return;
        }
    }

    // 3. Check Supabase session
    console.log('\n🔐 Checking Supabase session...');
    const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();

    if (sessionError) {
        console.error('❌ Session error:', sessionError.message);
    }

    if (sessionData?.session) {
        console.log('✅ Active Supabase session found!');
        console.log('   User:', sessionData.session.user.email);
        console.log('   Provider:', sessionData.session.user.app_metadata?.provider || 'email');
        
        // Session exists, just need to sync the data
        const supabaseUser = sessionData.session.user;
        
        // Update gb_current_user with Supabase data
        const syncedUser = {
            ...gbUser,
            id: supabaseUser.id,
            email: supabaseUser.email,
            full_name: supabaseUser.user_metadata?.full_name || 
                      supabaseUser.user_metadata?.name ||
                      gbUser.full_name ||
                      supabaseUser.email.split('@')[0],
            avatar_url: supabaseUser.user_metadata?.avatar_url || gbUser.avatar_url,
            lastLogin: new Date().toISOString(),
            auth_provider: supabaseUser.app_metadata?.provider || 'email',
            supabase_synced: true
        };

        localStorage.setItem('gb_current_user', JSON.stringify(syncedUser));
        console.log('✅ Local user data updated with Supabase info');
        console.log('\n🎉 SYNC COMPLETE! Reload the page to see changes.');
        
        return syncedUser;
    }

    // 4. No Supabase session - this is the problem!
    console.warn('\n⚠️ NO ACTIVE SUPABASE SESSION');
    console.log('You have local data but no Supabase authentication.');
    
    // Check what auth provider was used
    const authProvider = gbUser.auth_provider || 'unknown';
    console.log('\n📋 Local User Info:');
    console.log('   Email:', gbUser.email);
    console.log('   Name:', gbUser.full_name || gbUser.name);
    console.log('   Auth Provider:', authProvider);
    console.log('   Last Login:', gbUser.lastLogin);

    // 5. Provide solutions based on the situation
    console.log('\n💡 ========================================');
    console.log('💡 POSSIBLE SOLUTIONS');
    console.log('💡 ========================================\n');

    console.log('OPTION 1: Re-authenticate with Supabase');
    console.log('If you logged in with email/password:');
    console.log('  → Go to /pages/auth/login.html and login again\n');

    console.log('OPTION 2: Check Supabase storage key');
    console.log('The Supabase token might be stored under a different key:');
    
    // List all storage keys that might contain auth data
    const storageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('supabase') || key.includes('sb-')) {
            storageKeys.push(key);
        }
    }
    
    if (storageKeys.length > 0) {
        console.log('  Found these Supabase keys:');
        storageKeys.forEach(key => {
            const value = localStorage.getItem(key);
            try {
                const parsed = JSON.parse(value);
                const hasToken = parsed?.access_token || parsed?.token;
                console.log(`  - ${key}: ${hasToken ? '✓ Has token' : '✗ No token'}`);
            } catch {
                console.log(`  - ${key}: (non-JSON data)`);
            }
        });
        
        // Try to find and use a valid token
        console.log('\n🔧 Attempting to restore session from storage keys...');
        
        for (const key of storageKeys) {
            try {
                const value = localStorage.getItem(key);
                const parsed = JSON.parse(value);
                
                if (parsed?.access_token && parsed?.refresh_token) {
                    console.log(`   Trying ${key}...`);
                    
                    // Try to set the session
                    const { data, error } = await window.supabaseClient.auth.setSession({
                        access_token: parsed.access_token,
                        refresh_token: parsed.refresh_token
                    });
                    
                    if (error) {
                        console.log(`   ✗ Failed: ${error.message}`);
                    } else if (data?.session) {
                        console.log(`   ✅ SUCCESS! Session restored from ${key}`);
                        console.log(`   User: ${data.session.user.email}`);
                        
                        // Update gb_current_user
                        const syncedUser = {
                            ...gbUser,
                            id: data.session.user.id,
                            email: data.session.user.email,
                            full_name: data.session.user.user_metadata?.full_name || gbUser.full_name,
                            avatar_url: data.session.user.user_metadata?.avatar_url || gbUser.avatar_url,
                            lastLogin: new Date().toISOString(),
                            supabase_synced: true
                        };
                        
                        localStorage.setItem('gb_current_user', JSON.stringify(syncedUser));
                        console.log('\n🎉 SYNC COMPLETE! Reload the page.');
                        return syncedUser;
                    }
                }
            } catch (err) {
                console.log(`   ✗ Error with ${key}:`, err.message);
            }
        }
        
        console.log('\n⚠️ Could not restore session from any storage key');
    } else {
        console.log('  ✗ No Supabase storage keys found\n');
    }

    console.log('OPTION 3: Clear everything and start fresh');
    console.log('Run this in console:');
    console.log('  localStorage.clear();');
    console.log('  location.href = "/pages/auth/login.html";\n');

    console.log('OPTION 4: Create Supabase user from local data (if user exists)');
    console.log('If you want to keep the local data, you need to:');
    console.log('  1. Login with the same email at /pages/auth/login.html');
    console.log('  2. Or create a new account with this email');
    console.log('  3. The data will sync automatically\n');

    // 6. Check if we're in file:// protocol
    if (window.location.protocol === 'file:') {
        console.log('\n⚠️ WARNING: Running on file:// protocol');
        console.log('Supabase OAuth might not work properly.');
        console.log('Consider using a local server (http://localhost:8000)\n');
    }

    console.log('🔄 ========================================\n');
    
    return null;
})();
