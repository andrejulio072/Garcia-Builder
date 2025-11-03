// Garcia Builder - User Data Export Utilities
(() => {
  const STATUS_ELEMENT_ID = 'user-data-export-status';
  const DOWNLOAD_BUTTON_ID = 'download-user-data';
  const SYNC_BUTTON_ID = 'sync-user-data';

  const showStatus = (variant, message) => {
    const el = document.getElementById(STATUS_ELEMENT_ID);
    if (!el) return;

    const bootstrapVariant = ['success', 'danger', 'warning', 'info'].includes(variant)
      ? variant
      : 'info';

    el.className = `alert alert-${bootstrapVariant} mt-3`;
    el.textContent = message;
    el.classList.remove('d-none');
  };

  const safeParse = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  };

  const collectStorageSnapshot = (userId) => {
    const local = {};
    const session = {};
    const prefixes = [
      `garcia_profile_${userId || 'guest'}`,
      `gb_body_metrics_${userId || 'guest'}`,
      'gb_brutal_',
      'gb_body_metrics_',
      'garcia_profile_',
      'gb_current_user',
      'garcia_user',
      'garcia_profile_guest',
      'sb-' // supabase auth tokens
    ];

    const shouldCapture = (key) => prefixes.some((prefix) => key.startsWith(prefix));

    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (shouldCapture(key)) {
          local[key] = safeParse(localStorage.getItem(key));
        }
      }
    } catch (error) {
      console.warn('UserDataExport: Failed to read localStorage snapshot', error);
    }

    try {
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        if (shouldCapture(key)) {
          session[key] = safeParse(sessionStorage.getItem(key));
        }
      }
    } catch (error) {
      console.warn('UserDataExport: Failed to read sessionStorage snapshot', error);
    }

    return { localStorage: local, sessionStorage: session };
  };

  const getSupabaseSnapshots = async (userId) => {
    if (!window.supabaseClient || !userId) {
      return null;
    }

    try {
      const [{ data: profileRow, error: profileError }, { data: metricsRows, error: metricsError }] =
        await Promise.all([
          window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          window.supabaseClient
            .from('body_metrics')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })
        ]);

      if (profileError) {
        console.warn('UserDataExport: Failed to load Supabase profile row', profileError);
      }
      if (metricsError) {
        console.warn('UserDataExport: Failed to load Supabase body metrics rows', metricsError);
      }

      return {
        profile: profileRow || null,
        body_metrics: Array.isArray(metricsRows) ? metricsRows : []
      };
    } catch (error) {
      console.warn('UserDataExport: Supabase snapshot skipped', error);
      return null;
    }
  };

  const gatherBodyMetricsEntries = async (userId) => {
    try {
      if (window.BodyMetrics?.loadBodyMetrics) {
        const entries = await window.BodyMetrics.loadBodyMetrics();
        if (Array.isArray(entries)) {
          return entries;
        }
      }
    } catch (error) {
      console.warn('UserDataExport: BodyMetrics.loadBodyMetrics failed', error);
    }

    // Fallback to localStorage cache
    const key = `gb_body_metrics_${userId || 'guest'}`;
    return safeParse(localStorage.getItem(key)) || [];
  };

  const cloneData = (data) => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return data;
    }
  };

  const downloadFile = (content, filename, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sanitizeFilename = (value) => value.replace(/[^0-9a-zA-Z-_]/g, '-');

  const exportUserData = async () => {
    const manager = window.GarciaProfileManager;

    const profileData = manager?.getProfileData ? cloneData(manager.getProfileData()) : null;
    let user = null;
    try {
      if (manager?.getCurrentUser) {
        user = await manager.getCurrentUser();
      } else if (window.supabaseClient?.auth) {
        const { data } = await window.supabaseClient.auth.getUser();
        user = data?.user || null;
      }
    } catch (error) {
      console.warn('UserDataExport: Unable to resolve authenticated user', error);
    }

    const userId = user?.id || profileData?.basic?.id || null;
    const storageSnapshot = collectStorageSnapshot(userId);
    const supabaseSnapshot = await getSupabaseSnapshots(userId);
    const bodyMetricEntries = await gatherBodyMetricsEntries(userId);
    const brutalPending = storageSnapshot.localStorage
      ? Object.fromEntries(
          Object.entries(storageSnapshot.localStorage).filter(([key]) => key.startsWith('gb_brutal_'))
        )
      : {};

    const exportPayload = {
      exported_at: new Date().toISOString(),
      environment: {
        protocol: window.location.protocol,
        user_agent: navigator.userAgent,
        platform: navigator.platform
      },
      user: user
        ? {
            id: user.id,
            email: user.email,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            last_sign_in_at: user.last_sign_in_at
          }
        : null,
      profile_data: profileData,
      body_metrics_entries: bodyMetricEntries,
      local_storage: storageSnapshot,
      brutal_sync_cache: brutalPending,
      supabase_snapshot: supabaseSnapshot
    };

    return exportPayload;
  };

  const handleDownload = async () => {
    try {
      showStatus('info', 'Preparing your data export...');
      const exportPayload = await exportUserData();
      const userId = exportPayload?.user?.id || exportPayload?.profile_data?.basic?.id || 'guest';
      const timestamp = sanitizeFilename(new Date().toISOString());
      const filename = `garcia-builder-export-${sanitizeFilename(userId)}-${timestamp}.json`;
      downloadFile(JSON.stringify(exportPayload, null, 2), filename);
      showStatus('success', 'Download started! Keep this file safe.');
    } catch (error) {
      console.error('UserDataExport: download failed', error);
      showStatus('danger', `Failed to export data: ${error.message}`);
    }
  };

  const handleSync = async () => {
    try {
      showStatus('info', 'Syncing local changes to Supabase...');

      if (window.GarciaProfileManager?.saveProfileData) {
        await window.GarciaProfileManager.saveProfileData(null, { silent: true });
      }

      if (window.BrutalSync?.syncPending) {
        await window.BrutalSync.syncPending();
      }

      if (window.BodyMetrics?.loadBodyMetrics) {
        await window.BodyMetrics.loadBodyMetrics();
      }

      showStatus('success', 'Sync complete. Online data is up to date.');
    } catch (error) {
      console.warn('UserDataExport: sync error', error);
      showStatus('warning', `Sync finished with warnings: ${error.message}`);
    }
  };

  const init = () => {
    const downloadButton = document.getElementById(DOWNLOAD_BUTTON_ID);
    if (downloadButton) {
      downloadButton.addEventListener('click', handleDownload);
    }

    const syncButton = document.getElementById(SYNC_BUTTON_ID);
    if (syncButton) {
      syncButton.addEventListener('click', handleSync);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.UserDataExport = {
    exportUserData,
    collectStorageSnapshot,
    showStatus
  };
})();
