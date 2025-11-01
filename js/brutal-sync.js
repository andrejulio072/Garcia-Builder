/**
 * BRUTAL SYNC SYSTEM
 * Garante que TODOS os dados sejam salvos e sincronizados entre:
 * - Dashboard
 * - My Profile
 * - localStorage
 * - Supabase (quando disponível)
 */
(() => {
    console.log('🔨 BRUTAL SYNC - Initializing...');

    // Central data store
    let syncData = {
        user: null,
        profile: null,
        metrics: null,
        lastSync: null
    };

    /**
     * BRUTAL SAVE - Salva dados SEMPRE, não importa o que aconteça
     */
    const brutalSave = async (section, data) => {
        console.log(`💾 BRUTAL SAVE - Section: ${section}`, data);

        try {
            // 1. SEMPRE salva no localStorage PRIMEIRO
            const key = `gb_brutal_${section}`;
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now(),
                synced: false
            }));
            console.log(`✅ localStorage saved: ${key}`);

            // 2. Atualiza cache em memória
            syncData[section] = data;

            // 3. Tenta salvar no Supabase (não bloqueia se falhar)
            if (window.supabaseClient) {
                try {
                    await saveToSupabase(section, data);
                    
                    // Marca como sincronizado
                    localStorage.setItem(key, JSON.stringify({
                        data: data,
                        timestamp: Date.now(),
                        synced: true
                    }));
                    console.log(`✅ Supabase synced: ${section}`);
                } catch (err) {
                    console.warn(`⚠️ Supabase save failed for ${section}, data kept in localStorage:`, err.message);
                }
            }

            // 4. Atualiza a UI imediatamente
            broadcastUpdate(section, data);

            return { success: true, synced: !!window.supabaseClient };

        } catch (error) {
            console.error(`❌ BRUTAL SAVE failed for ${section}:`, error);
            throw error;
        }
    };

    /**
     * Salva no Supabase baseado na seção
     */
    const saveToSupabase = async (section, data) => {
        const user = getCurrentUser();
        if (!user?.id) throw new Error('No user ID');

        switch (section) {
            case 'profile':
                // Salva perfil básico
                await window.supabaseClient
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: data.full_name,
                        phone: data.phone,
                        avatar_url: data.avatar_url,
                        date_of_birth: data.birthday,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' });

                // Atualiza user_metadata
                await window.supabaseClient.auth.updateUser({
                    data: {
                        full_name: data.full_name,
                        phone: data.phone,
                        avatar_url: data.avatar_url
                    }
                });
                break;

            case 'metrics':
                // Salva métricas corporais
                const today = new Date().toISOString().slice(0, 10);
                await window.supabaseClient
                    .from('body_metrics')
                    .upsert({
                        user_id: user.id,
                        date: today,
                        weight: data.current_weight,
                        height: data.height,
                        body_fat: data.body_fat_percentage,
                        measurements: {
                            chest: data.measurements?.chest,
                            waist: data.measurements?.waist,
                            hips: data.measurements?.hips,
                            arms: data.measurements?.arms,
                            thighs: data.measurements?.thighs
                        },
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id,date' });
                break;

            default:
                console.warn(`⚠️ Unknown section: ${section}`);
        }
    };

    /**
     * BRUTAL LOAD - Carrega dados de qualquer fonte disponível
     */
    const brutalLoad = (section) => {
        console.log(`📖 BRUTAL LOAD - Section: ${section}`);

        try {
            // 1. Tenta cache em memória
            if (syncData[section]) {
                console.log(`✅ Loaded from memory cache: ${section}`);
                return syncData[section];
            }

            // 2. Tenta localStorage
            const key = `gb_brutal_${section}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                syncData[section] = parsed.data;
                console.log(`✅ Loaded from localStorage: ${section}`, parsed);
                return parsed.data;
            }

            // 3. Tenta GarciaProfileManager (compatibilidade)
            if (window.GarciaProfileManager) {
                const profileData = window.GarciaProfileManager.getProfileData();
                if (profileData && profileData[section]) {
                    console.log(`✅ Loaded from GarciaProfileManager: ${section}`);
                    return profileData[section];
                }
            }

            console.warn(`⚠️ No data found for section: ${section}`);
            return null;

        } catch (error) {
            console.error(`❌ BRUTAL LOAD failed for ${section}:`, error);
            return null;
        }
    };

    /**
     * Broadcast update para todas as partes da UI
     */
    const broadcastUpdate = (section, data) => {
        console.log(`📡 Broadcasting update: ${section}`);

        // Custom event para atualizar componentes
        window.dispatchEvent(new CustomEvent('brutal:dataUpdate', {
            detail: { section, data }
        }));

        // Atualiza dashboard se estiver na página
        if (window.location.pathname.includes('dashboard')) {
            updateDashboardFromData(section, data);
        }

        // Atualiza profile se estiver na página
        if (window.location.pathname.includes('my-profile')) {
            updateProfileFromData(section, data);
        }
    };

    /**
     * Atualiza dashboard com novos dados
     */
    const updateDashboardFromData = (section, data) => {
        try {
            if (section === 'metrics') {
                // Atualiza cards de métricas
                if (data.current_weight) {
                    const el = document.getElementById('current-weight');
                    if (el) el.textContent = `${data.current_weight}kg`;
                }

                if (data.height && data.current_weight) {
                    const bmi = data.current_weight / Math.pow(data.height / 100, 2);
                    const bmiEl = document.getElementById('bmi');
                    if (bmiEl) bmiEl.textContent = bmi.toFixed(1);
                }

                if (data.body_fat_percentage) {
                    const el = document.getElementById('body-fat');
                    if (el) el.textContent = `${data.body_fat_percentage}%`;
                }
            }

            if (section === 'profile') {
                // Atualiza nome
                if (data.full_name) {
                    const el = document.getElementById('user-name');
                    if (el) el.textContent = data.full_name;
                }
            }
        } catch (error) {
            console.warn('Dashboard update failed:', error);
        }
    };

    /**
     * Atualiza profile com novos dados
     */
    const updateProfileFromData = (section, data) => {
        try {
            if (section === 'metrics') {
                // Atualiza displays
                if (data.current_weight) {
                    const el = document.getElementById('display-weight');
                    if (el) el.textContent = `${data.current_weight} kg`;
                }

                if (data.height) {
                    const el = document.getElementById('display-height');
                    if (el) el.textContent = `${data.height} cm`;
                }

                if (data.body_fat_percentage) {
                    const el = document.getElementById('display-body-fat');
                    if (el) el.textContent = `${data.body_fat_percentage}%`;
                }
            }
        } catch (error) {
            console.warn('Profile update failed:', error);
        }
    };

    /**
     * Get current user from multiple sources
     */
    const getCurrentUser = () => {
        // Try cache
        if (syncData.user) return syncData.user;

        // Try localStorage
        const stored = localStorage.getItem('gb_current_user');
        if (stored) {
            syncData.user = JSON.parse(stored);
            return syncData.user;
        }

        // Try AuthSystem
        if (typeof AuthSystem !== 'undefined' && AuthSystem.getCurrentUser) {
            syncData.user = AuthSystem.getCurrentUser();
            return syncData.user;
        }

        return null;
    };

    /**
     * Sync pendentes quando online
     */
    const syncPending = async () => {
        console.log('🔄 Syncing pending data...');

        const sections = ['profile', 'metrics'];
        let synced = 0;

        for (const section of sections) {
            const key = `gb_brutal_${section}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const parsed = JSON.parse(stored);
                if (!parsed.synced && window.supabaseClient) {
                    try {
                        await saveToSupabase(section, parsed.data);
                        
                        // Marca como sincronizado
                        localStorage.setItem(key, JSON.stringify({
                            ...parsed,
                            synced: true
                        }));
                        synced++;
                    } catch (err) {
                        console.warn(`Failed to sync ${section}:`, err.message);
                    }
                }
            }
        }

        if (synced > 0) {
            console.log(`✅ Synced ${synced} pending items`);
        }
    };

    // Public API
    window.BrutalSync = {
        save: brutalSave,
        load: brutalLoad,
        getCurrentUser: getCurrentUser,
        syncPending: syncPending
    };

    // Auto-sync quando ficar online
    window.addEventListener('online', () => {
        console.log('🌐 Network online - syncing...');
        syncPending();
    });

    // Sync inicial
    if (window.supabaseClient) {
        setTimeout(syncPending, 2000);
    }

    console.log('✅ BRUTAL SYNC - Ready!');
})();
