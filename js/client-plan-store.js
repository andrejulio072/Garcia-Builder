(function initClientPlanStore(global) {
  'use strict';

  const CACHE_PREFIX = 'gb_client_plans_v1:';
  const PENDING_KEY = 'gb_pending_template_v1';

  const safeJson = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  };

  const clone = (value) => safeJson(JSON.stringify(value), {});
  const nowIso = () => new Date().toISOString();
  const todayIso = () => new Date().toISOString().slice(0, 10);
  const localId = () => global.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const normalizeTemplate = (template) => {
    const type = template?.template_type === 'nutrition' ? 'nutrition' : 'workout';
    const title = String(template?.title || 'Saved plan').trim().slice(0, 180);
    const rawKey = String(template?.template_key || title).trim().toLowerCase();
    const templateKey = rawKey
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 160) || `plan-${Date.now()}`;

    return {
      template_type: type,
      template_key: templateKey,
      title,
      source_url: String(template?.source_url || global.location?.pathname || '').slice(0, 500),
      template_snapshot: clone(template?.template_snapshot || {}),
      is_active: template?.is_active !== false,
      updated_at: nowIso()
    };
  };

  const getClient = async () => {
    if (global.supabaseClient?.auth) return global.supabaseClient;
    if (typeof global.waitForSupabaseClient === 'function') {
      try {
        return await global.waitForSupabaseClient(7000);
      } catch (_) {
        return null;
      }
    }
    return null;
  };

  const getUser = async () => {
    const client = await getClient();
    if (client?.auth?.getUser) {
      const { data, error } = await client.auth.getUser();
      if (!error && data?.user) return { client, user: data.user };
    }

    const local = safeJson(global.localStorage?.getItem('gb_current_user'), null);
    return { client, user: local?.id ? local : null };
  };

  const cacheKey = (userId) => `${CACHE_PREFIX}${userId || 'guest'}`;
  const readCache = (userId) => {
    const empty = { templates: [], workoutLogs: [], nutritionLogs: [] };
    return safeJson(global.localStorage?.getItem(cacheKey(userId)), empty) || empty;
  };
  const writeCache = (userId, data) => {
    global.localStorage?.setItem(cacheKey(userId), JSON.stringify(data));
    return data;
  };

  const cacheTemplate = (userId, row) => {
    const cache = readCache(userId);
    if (row.is_active) {
      cache.templates = cache.templates.map((item) => item.template_type === row.template_type ? { ...item, is_active: false } : item);
    }
    const idx = cache.templates.findIndex((item) => item.template_type === row.template_type && item.template_key === row.template_key);
    const cached = { ...row, id: row.id || cache.templates[idx]?.id || localId(), user_id: userId, created_at: row.created_at || cache.templates[idx]?.created_at || nowIso() };
    if (idx >= 0) cache.templates[idx] = cached;
    else cache.templates.unshift(cached);
    writeCache(userId, cache);
    return cached;
  };

  const requireUser = async () => {
    const context = await getUser();
    if (!context.user?.id) {
      const error = new Error('SIGN_IN_REQUIRED');
      error.code = 'SIGN_IN_REQUIRED';
      throw error;
    }
    return context;
  };

  const queueTemplate = (template) => {
    global.localStorage?.setItem(PENDING_KEY, JSON.stringify(normalizeTemplate(template)));
  };

  const saveTemplate = async (template) => {
    const normalized = normalizeTemplate(template);
    const { client, user } = await getUser();
    if (!user?.id) {
      queueTemplate(normalized);
      return { data: normalized, synced: false, requiresAuth: true };
    }

    const payload = { ...normalized, user_id: user.id };
    if (client) {
      try {
        const { data, error } = await client
          .from('user_saved_templates')
          .upsert(payload, { onConflict: 'user_id,template_type,template_key' })
          .select()
          .single();
        if (error) throw error;
        const { error: deactivateError } = await client
          .from('user_saved_templates')
          .update({ is_active: false, updated_at: nowIso() })
          .eq('user_id', user.id)
          .eq('template_type', normalized.template_type)
          .neq('id', data.id);
        if (deactivateError) throw deactivateError;
        return { data: cacheTemplate(user.id, data), synced: true };
      } catch (error) {
        console.warn('[PlanStore] Template cloud sync deferred:', error.message || error);
      }
    }

    return { data: cacheTemplate(user.id, payload), synced: false };
  };

  const consumePendingTemplate = async () => {
    const pending = safeJson(global.localStorage?.getItem(PENDING_KEY), null);
    if (!pending) return null;
    const result = await saveTemplate(pending);
    if (!result.requiresAuth) global.localStorage?.removeItem(PENDING_KEY);
    return result;
  };

  const listTemplates = async () => {
    const { client, user } = await requireUser();
    if (client) {
      try {
        const { data, error } = await client
          .from('user_saved_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        if (error) throw error;
        const cache = readCache(user.id);
        cache.templates = data || [];
        writeCache(user.id, cache);
        return { data: cache.templates, synced: true };
      } catch (error) {
        console.warn('[PlanStore] Reading cached templates:', error.message || error);
      }
    }
    return { data: readCache(user.id).templates || [], synced: false };
  };

  const setActiveTemplate = async (templateId, type) => {
    const { client, user } = await requireUser();
    const cache = readCache(user.id);
    cache.templates = cache.templates.map((item) => ({
      ...item,
      is_active: item.template_type === type ? item.id === templateId : item.is_active,
      updated_at: item.id === templateId ? nowIso() : item.updated_at
    }));
    writeCache(user.id, cache);

    if (!client || String(templateId).startsWith('local-')) return { synced: false };
    try {
      const { error } = await client
        .from('user_saved_templates')
        .update({ is_active: true, updated_at: nowIso() })
        .eq('user_id', user.id)
        .eq('id', templateId);
      if (error) throw error;
      const { error: clearError } = await client
        .from('user_saved_templates')
        .update({ is_active: false, updated_at: nowIso() })
        .eq('user_id', user.id)
        .eq('template_type', type)
        .neq('id', templateId);
      if (clearError) throw clearError;
      return { synced: true };
    } catch (error) {
      console.warn('[PlanStore] Active plan cloud sync deferred:', error.message || error);
      return { synced: false };
    }
  };

  const deleteTemplate = async (templateId) => {
    const { client, user } = await requireUser();
    const cache = readCache(user.id);
    cache.templates = cache.templates.filter((item) => item.id !== templateId);
    writeCache(user.id, cache);
    if (!client || String(templateId).startsWith('local-')) return { synced: false };
    const { error } = await client.from('user_saved_templates').delete().eq('user_id', user.id).eq('id', templateId);
    if (error) throw error;
    return { synced: true };
  };

  const saveWorkoutLog = async (entry) => {
    const { client, user } = await requireUser();
    const payload = {
      user_id: user.id,
      saved_template_id: entry.saved_template_id || null,
      workout_date: entry.workout_date || todayIso(),
      title: String(entry.title || entry.workout_name || 'Workout').slice(0, 180),
      workout_name: String(entry.workout_name || entry.title || 'Workout').slice(0, 180),
      duration_minutes: Number(entry.duration_minutes) || null,
      completed: entry.completed !== false,
      exercises: Array.isArray(entry.exercises) ? entry.exercises : [],
      notes: String(entry.notes || '').slice(0, 2000),
      updated_at: nowIso()
    };
    const cache = readCache(user.id);
    const localRow = { ...payload, id: localId(), created_at: nowIso() };

    if (client) {
      try {
        const { data, error } = await client.from('workout_logs').insert(payload).select().single();
        if (error) throw error;
        cache.workoutLogs.unshift(data);
        writeCache(user.id, cache);
        return { data, synced: true };
      } catch (error) {
        console.warn('[PlanStore] Workout cloud sync deferred:', error.message || error);
      }
    }
    cache.workoutLogs.unshift(localRow);
    writeCache(user.id, cache);
    return { data: localRow, synced: false };
  };

  const saveNutritionLog = async (entry) => {
    const { client, user } = await requireUser();
    const numberOrNull = (value) => value === '' || value == null ? null : Number(value);
    const payload = {
      user_id: user.id,
      saved_template_id: entry.saved_template_id || null,
      log_date: entry.log_date || todayIso(),
      meals_completed: Math.max(0, Number(entry.meals_completed) || 0),
      target_meals: Math.max(0, Number(entry.target_meals) || 0),
      calories: numberOrNull(entry.calories),
      protein_g: numberOrNull(entry.protein_g),
      carbs_g: numberOrNull(entry.carbs_g),
      fats_g: numberOrNull(entry.fats_g),
      water_ml: Math.max(0, Number(entry.water_ml) || 0),
      adherence_percent: Math.min(100, Math.max(0, Number(entry.adherence_percent) || 0)),
      notes: String(entry.notes || '').slice(0, 2000),
      updated_at: nowIso()
    };
    const cache = readCache(user.id);

    if (client) {
      try {
        const { data, error } = await client
          .from('nutrition_logs')
          .upsert(payload, { onConflict: 'user_id,log_date' })
          .select()
          .single();
        if (error) throw error;
        cache.nutritionLogs = [data, ...cache.nutritionLogs.filter((item) => item.log_date !== data.log_date)];
        writeCache(user.id, cache);
        return { data, synced: true };
      } catch (error) {
        console.warn('[PlanStore] Nutrition cloud sync deferred:', error.message || error);
      }
    }

    const localRow = { ...payload, id: cache.nutritionLogs.find((item) => item.log_date === payload.log_date)?.id || localId(), created_at: nowIso() };
    cache.nutritionLogs = [localRow, ...cache.nutritionLogs.filter((item) => item.log_date !== payload.log_date)];
    writeCache(user.id, cache);
    return { data: localRow, synced: false };
  };

  const listRecentLogs = async (limit = 14) => {
    const { client, user } = await requireUser();
    if (client) {
      try {
        const [workouts, nutrition] = await Promise.all([
          client.from('workout_logs').select('*').eq('user_id', user.id).order('workout_date', { ascending: false }).limit(limit),
          client.from('nutrition_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(limit)
        ]);
        if (workouts.error) throw workouts.error;
        if (nutrition.error) throw nutrition.error;
        const cache = readCache(user.id);
        cache.workoutLogs = workouts.data || [];
        cache.nutritionLogs = nutrition.data || [];
        writeCache(user.id, cache);
        return { workouts: cache.workoutLogs, nutrition: cache.nutritionLogs, synced: true };
      } catch (error) {
        console.warn('[PlanStore] Reading cached activity:', error.message || error);
      }
    }
    const cache = readCache(user.id);
    return { workouts: (cache.workoutLogs || []).slice(0, limit), nutrition: (cache.nutritionLogs || []).slice(0, limit), synced: false };
  };

  global.GBPlanStore = {
    getUser,
    saveTemplate,
    consumePendingTemplate,
    listTemplates,
    setActiveTemplate,
    deleteTemplate,
    saveWorkoutLog,
    saveNutritionLog,
    listRecentLogs,
    queueTemplate
  };
})(window);
