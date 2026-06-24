/**
 * 🔍 GARCIA BUILDER - SUPABASE DIAGNOSTIC TOOL
 * 
 * Cole este código no console do navegador para diagnosticar problemas de autenticação
 */

(async function garciaSupabaseDiagnostic() {
    console.log('🔍 ========================================');
    console.log('🔍 GARCIA BUILDER - SUPABASE DIAGNOSTIC');
    console.log('🔍 ========================================\n');

    const results = {
        environment: {},
        library: {},
        client: {},
        auth: {},
        localStorage: {}
    };

    // 1. Check Environment Variables
    console.log('1️⃣ CHECKING ENVIRONMENT VARIABLES...');
    results.environment = {
        __ENV: !!window.__ENV,
        SUPABASE_URL: window.SUPABASE_URL || window.__ENV?.SUPABASE_URL || null,
        SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY ? '✓ Present' : '✗ Missing',
        NEXT_PUBLIC_SUPABASE_URL: window.NEXT_PUBLIC_SUPABASE_URL || null,
        PUBLIC_SITE_URL: window.__ENV?.PUBLIC_SITE_URL || null
    };
    console.table(results.environment);

    // 2. Check Supabase Library
    console.log('\n2️⃣ CHECKING SUPABASE LIBRARY...');
    results.library = {
        'global supabase': typeof supabase,
        'window.supabase': typeof window.supabase,
        'createClient available': typeof (supabase?.createClient || window.supabase?.createClient) === 'function'
    };
    console.table(results.library);

    // 3. Check Supabase Client
    console.log('\n3️⃣ CHECKING SUPABASE CLIENT...');
    results.client = {
        'window.supabaseClient': !!window.supabaseClient,
        'client.auth': !!window.supabaseClient?.auth,
        'getUser method': typeof window.supabaseClient?.auth?.getUser === 'function',
        'getSession method': typeof window.supabaseClient?.auth?.getSession === 'function',
        'signOut method': typeof window.supabaseClient?.auth?.signOut === 'function'
    };
    console.table(results.client);

    // 4. Check Auth Status
    console.log('\n4️⃣ CHECKING AUTH STATUS...');
    if (window.supabaseClient) {
        try {
            // Test getSession
            console.log('Testing getSession()...');
            const { data: sessionData, error: sessionError } = await window.supabaseClient.auth.getSession();
            
            results.auth.session = {
                hasSession: !!sessionData?.session,
                error: sessionError?.message || null,
                user: sessionData?.session?.user?.email || null,
                expires: sessionData?.session?.expires_at || null
            };

            // Test getUser
            console.log('Testing getUser()...');
            const { data: userData, error: userError } = await window.supabaseClient.auth.getUser();
            
            results.auth.user = {
                hasUser: !!userData?.user,
                error: userError?.message || null,
                email: userData?.user?.email || null,
                id: userData?.user?.id || null,
                provider: userData?.user?.app_metadata?.provider || null
            };

            console.table(results.auth.session);
            console.table(results.auth.user);
        } catch (err) {
            console.error('❌ Auth check failed:', err);
            results.auth.error = err.message;
        }
    } else {
        console.warn('⚠️ Cannot check auth - supabaseClient not initialized');
        results.auth.error = 'Client not initialized';
    }

    // 5. Check LocalStorage
    console.log('\n5️⃣ CHECKING LOCALSTORAGE...');
    const authKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('supabase') || key.includes('sb-') || key.includes('auth') || key.includes('gb_')) {
            const value = localStorage.getItem(key);
            let displayValue;
            try {
                const parsed = JSON.parse(value);
                if (parsed && typeof parsed === 'object') {
                    displayValue = `Object (${Object.keys(parsed).length} keys)`;
                } else {
                    displayValue = String(parsed).substring(0, 50);
                }
            } catch {
                displayValue = String(value).substring(0, 50);
            }
            authKeys.push({ key, value: displayValue });
        }
    }
    console.table(authKeys);

    // 6. Check for Supabase Auth Token in LocalStorage
    console.log('\n6️⃣ CHECKING SUPABASE AUTH TOKEN...');
    const supabaseUrl = window.NEXT_PUBLIC_SUPABASE_URL || window.SUPABASE_URL || window.__ENV?.SUPABASE_URL || '';
    const projectRef = (String(supabaseUrl).match(/https:\/\/([a-z0-9]+)\.supabase\.co/i) || [])[1];
    const storageKey = projectRef ? `sb-${projectRef}-auth-token` : 'sb-auth-token';
    const authToken = localStorage.getItem(storageKey) || localStorage.getItem('sb-auth-token');
    if (authToken) {
        try {
            const parsed = JSON.parse(authToken);
            console.log('✅ Found Supabase auth token:', {
                hasAccessToken: !!parsed.access_token,
                hasRefreshToken: !!parsed.refresh_token,
                expiresAt: parsed.expires_at,
                user: parsed.user?.email
            });
        } catch (err) {
            console.warn('⚠️ Could not parse auth token:', err);
        }
    } else {
        console.warn('⚠️ No Supabase auth token found in localStorage');
        console.log('Possible storage key variations:');
        const possibleKeys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
            .filter(k => k && k.includes('sb-'));
        console.log(possibleKeys);
    }

    // 7. Summary
    console.log('\n📊 ========================================');
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('📊 ========================================');
    
    const issues = [];
    const warnings = [];
    const success = [];

    if (!results.environment.SUPABASE_URL) issues.push('Missing SUPABASE_URL');
    else success.push('Environment configured');

    if (!results.client['window.supabaseClient']) issues.push('Supabase client not initialized');
    else success.push('Client initialized');

    if (results.auth.error) issues.push(`Auth error: ${results.auth.error}`);
    else if (results.auth.user?.hasUser) success.push('User authenticated');
    else warnings.push('No active user session');

    if (authKeys.length === 0) warnings.push('No auth data in localStorage');
    else success.push(`Found ${authKeys.length} auth keys in localStorage`);

    console.log('\n✅ SUCCESS:', success.join(', '));
    if (warnings.length) console.log('\n⚠️ WARNINGS:', warnings.join(', '));
    if (issues.length) console.log('\n❌ ISSUES:', issues.join(', '));

    // 8. Recommendations
    console.log('\n💡 ========================================');
    console.log('💡 RECOMMENDATIONS');
    console.log('💡 ========================================');

    if (issues.includes('Supabase client not initialized')) {
        console.log('1. Open test-supabase-init.html to diagnose initialization');
        console.log('2. Check browser console for Supabase initialization errors');
        console.log('3. Ensure scripts load in correct order: env.js → @supabase/supabase-js → supabase.js');
    }

    if (!results.auth.user?.hasUser && authKeys.length > 0) {
        console.log('1. You have auth data but no active session - try refreshing the page');
        console.log('2. The session may have expired - try logging in again');
        console.log('3. Run: await window.supabaseClient.auth.refreshSession()');
    }

    if (results.auth.user?.hasUser) {
        console.log('✅ Everything looks good! You are authenticated.');
        console.log('To access user data:');
        console.log('  const { data } = await window.supabaseClient.auth.getUser();');
        console.log('  console.log(data.user);');
    }

    console.log('\n🔍 ========================================\n');

    return results;
})();
