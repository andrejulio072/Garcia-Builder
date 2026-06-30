(function(){
  'use strict';

  let me = null;
  let clients = [];
  let selectedClient = null;
  let sessions = [];
  const getTrainerDashboardLang = () => {
    try {
      const raw = window.GB_I18N?.getLang?.() ||
        localStorage.getItem('gb_lang') ||
        localStorage.getItem('gb_language') ||
        document.documentElement.lang ||
        'en';
      const lang = String(raw).toLowerCase();
      if (lang.startsWith('pt')) return 'pt';
      if (lang.startsWith('es')) return 'es';
      return 'en';
    } catch {
      return 'en';
    }
  };
  const getTrainerDashboardText = (key, fallback, replacements = {}) => {
    const readPath = (obj, path) => String(path || '').split('.').reduce((acc, part) => acc?.[part], obj);
    const lang = getTrainerDashboardLang();
    const template = readPath(window.DICTS?.[lang], key) || readPath(window.DICTS?.en, key) || fallback;
    return String(template).replace(/\{(\w+)\}/g, (_, token) => replacements[token] ?? '');
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    me = await getCurrentUser();
    if(!me){
      const ret = encodeURIComponent(window.location.pathname + window.location.search);
      const loginUrl = typeof window.toAbsoluteUrl === 'function'
        ? window.toAbsoluteUrl(`pages/auth/login.html?redirect=${ret}`)
        : `../auth/login.html?redirect=${ret}`;
      window.location.href = loginUrl;
      return;
    }
    await loadClients();
    await loadSessions();
    bindUI();
  }

  async function getCurrentUser(){
    try{
      let client = window.supabaseClient || null;
      if (!client?.auth && typeof window.waitForSupabaseClient === 'function') {
        try {
          client = await window.waitForSupabaseClient(6000);
        } catch (readyError) {
          console.warn('Supabase client was not ready for trainer dashboard:', readyError?.message || readyError);
        }
      }

      if (client?.auth) {
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session?.user) return sessionData.session.user;

        const { data: { user } } = await client.auth.getUser();
        if (user) return user;
      }
      const stored = localStorage.getItem('gb_current_user');
      return stored ? JSON.parse(stored) : null;
    }catch(e){
      console.error('getCurrentUser failed', e);
      return null;
    }
  }

  async function loadClients(){
    try{
      // Fetch users who have this trainer assigned
      const { data, error } = await window.supabaseClient
        .from('user_profiles')
        .select('user_id, full_name, email, avatar_url, trainer_id')
        .eq('trainer_id', me.id);
      if(error) throw error;
      clients = data || [];
      renderClientList();
    }catch(e){
      console.error('loadClients error:', e);
      const ul = document.getElementById('client-list');
      if (ul) ul.innerHTML = `<li class="list-group-item bg-transparent text-danger">Failed to load clients: ${e.message||e}</li>`;
    }
  }

  function renderClientList(){
    const ul = document.getElementById('client-list');
    const q = (document.getElementById('client-search')?.value||'').toLowerCase();
    if(!ul) return;

    const filtered = clients.filter(c => !q ||
      (c.full_name||'').toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q)
    );

    ul.innerHTML = '';
    if (filtered.length === 0){
      ul.innerHTML = '<li class="list-group-item bg-transparent text-muted">No clients found</li>';
      return;
    }

    for (const c of filtered){
      const li = document.createElement('li');
      li.className = 'list-group-item bg-transparent d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <img src="${c.avatar_url || 'assets/avatar-m1.svg'}" style="width:32px;height:32px;border-radius:50%"/>
          <div>
            <div>${c.full_name || 'Unnamed'}</div>
            <small class="text-muted">${c.email||''}</small>
          </div>
        </div>
        <span class="badge badge-soft">Client</span>
      `;
      li.addEventListener('click', ()=>selectClient(c));
      ul.appendChild(li);
    }
  }

  function bindUI(){
    document.getElementById('client-search')?.addEventListener('input', renderClientList);
    document.getElementById('session-form')?.addEventListener('submit', createSession);
  }

  async function selectClient(c){
    selectedClient = c;
    const box = document.getElementById('client-details');
    if (!box) return;

    try{
      // Load some extra details
      const [
        { data: metricsRows },
        { data: prefs },
        { data: macros },
        { data: habitsRows },
        { data: photos },
        { data: workouts }
      ] = await Promise.all([
        window.supabaseClient.from('body_metrics').select('*').eq('user_id', c.user_id).order('date', { ascending: false }).order('updated_at', { ascending: false }).limit(1),
        window.supabaseClient.from('user_preferences').select('*').eq('user_id', c.user_id).maybeSingle(),
        window.supabaseClient.from('user_macros').select('*').eq('user_id', c.user_id).maybeSingle(),
        window.supabaseClient.from('user_habits').select('*').eq('user_id', c.user_id).order('date', { ascending: false }).limit(7),
        window.supabaseClient.from('progress_photos').select('*').eq('user_id', c.user_id).order('taken_at', { ascending: false }).limit(6),
        window.supabaseClient.from('workout_logs').select('*').eq('user_id', c.user_id).order('workout_date', { ascending: false }).order('created_at', { ascending: false }).limit(5)
      ]);
      const metrics = Array.isArray(metricsRows) ? metricsRows[0] : null;
      const latestHabit = Array.isArray(habitsRows) ? habitsRows[0] : null;
      const photoGrid = Array.isArray(photos) && photos.length
        ? photos.map((photo) => `<img src="${photo.photo_url}" alt="Progress photo" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.15)"/>`).join('')
        : '<span class="text-muted small">No progress photos yet</span>';
      const workoutList = Array.isArray(workouts) && workouts.length
        ? workouts.map((workout) => `<li class="small">${workout.workout_date || ''} - ${workout.title || workout.workout_name || 'Workout'}</li>`).join('')
        : '<li class="small text-muted">No workout logs yet</li>';

      box.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${c.avatar_url || 'assets/avatar-m1.svg'}" style="width:56px;height:56px;border-radius:50%"/>
          <div>
            <div class="h5 m-0">${c.full_name || 'Unnamed'}</div>
            <div class="text-muted">${c.email||''}</div>
          </div>
        </div>
        <div class="row g-2">
          <div class="col-md-4"><div class="p-2 card">Weight: <b>${metrics?.weight ?? '--'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Height: <b>${metrics?.height ?? '--'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Units: <b>${prefs?.units ?? 'metric'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Body fat: <b>${metrics?.body_fat ?? '--'}%</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Calories: <b>${macros?.calories ?? '--'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Steps: <b>${latestHabit?.steps ?? '--'}</b></div></div>
        </div>
        <div class="mt-3">
          <h6 class="text-warning">Recent Progress Photos</h6>
          <div class="d-flex flex-wrap gap-2">${photoGrid}</div>
        </div>
        <div class="mt-3">
          <h6 class="text-warning">Recent Workout Logs</h6>
          <ul class="mb-0 ps-3">${workoutList}</ul>
        </div>
      `;
    }catch(e){
      console.error('selectClient details error', e);
      box.innerHTML = '<div class="text-danger">Failed to load client details</div>';
    }
  }

  async function loadSessions(){
    try{
      const { data, error } = await window.supabaseClient
        .from('sessions')
        .select(`
          *,
          user_profiles:user_id(full_name, email)
        `)
        .eq('trainer_id', me.id)
        .order('scheduled_at', { ascending: true });

      if(error) throw error;
      sessions = data || [];
      renderSessions();
    }catch(e){
      console.error('loadSessions error:', e);
    }
  }

  function renderSessions(){
    const container = document.getElementById('sessions-list');
    if (!container) return;

    if (sessions.length === 0) {
      container.innerHTML = '<div class="text-muted">No sessions scheduled</div>';
      return;
    }

    const now = new Date();
    const upcomingSessions = sessions.filter(s => new Date(s.scheduled_at) > now);
    const pastSessions = sessions.filter(s => new Date(s.scheduled_at) <= now);

    let html = '';

    if (upcomingSessions.length > 0) {
      html += '<h6 class="mb-2 text-warning">Upcoming Sessions</h6>';
      upcomingSessions.forEach(session => {
        const date = new Date(session.scheduled_at).toLocaleString();
        html += `
          <div class="session-item p-2 mb-2 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <strong>${session.title}</strong>
                <div class="text-muted small">${session.user_profiles?.full_name || 'Unknown Client'}</div>
                <div class="text-muted small">${date}</div>
                ${session.notes ? `<div class="text-muted small mt-1">${session.notes}</div>` : ''}
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-success btn-sm" onclick="updateSessionStatus('${session.id}', 'completed')">Complete</button>
                <button class="btn btn-outline-danger btn-sm" onclick="updateSessionStatus('${session.id}', 'cancelled')">Cancel</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    if (pastSessions.length > 0) {
      html += '<h6 class="mb-2 mt-3 text-success">Recent Sessions</h6>';
      pastSessions.slice(0, 5).forEach(session => {
        const date = new Date(session.scheduled_at).toLocaleString();
        const statusClass = session.status === 'completed' ? 'text-success' :
                           session.status === 'cancelled' ? 'text-danger' : 'text-muted';
        html += `
          <div class="session-item p-2 mb-2 border rounded">
            <div>
              <strong>${session.title}</strong>
              <span class="badge badge-soft ms-2 ${statusClass}">${session.status || 'scheduled'}</span>
              <div class="text-muted small">${session.user_profiles?.full_name || 'Unknown Client'}</div>
              <div class="text-muted small">${date}</div>
              ${session.notes ? `<div class="text-muted small mt-1">${session.notes}</div>` : ''}
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  async function updateSessionStatus(sessionId, status) {
    try {
      const { error } = await window.supabaseClient
        .from('sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      // Update local sessions array
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      if (sessionIndex >= 0) {
        sessions[sessionIndex].status = status;
        renderSessions();
      }

      showNotification(getTrainerDashboardText('trainer_dashboard.session_status_updated', 'Session marked as {status}.', { status }), 'success');
    } catch (error) {
      console.error('Error updating session status:', error);
      showNotification(getTrainerDashboardText('trainer_dashboard.session_status_failed', 'Failed to update session status.'), 'error');
    }
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Make updateSessionStatus globally available
  window.updateSessionStatus = updateSessionStatus;

  async function createSession(e){
    e.preventDefault();
    if (!selectedClient){
      showNotification(getTrainerDashboardText('trainer_dashboard.client_required', 'Please select a client first.'), 'error');
      return;
    }
    try{
      const scheduled_at = document.getElementById('scheduled_at').value;
      const title = document.getElementById('title').value;
      const notes = document.getElementById('notes').value;

      const payload = {
        user_id: selectedClient.user_id,
        trainer_id: me.id,
        title,
        notes,
        scheduled_at: new Date(scheduled_at).toISOString()
      };

      const { error } = await window.supabaseClient.from('sessions').insert(payload);
      if (error) throw error;

      showNotification(getTrainerDashboardText('trainer_dashboard.session_created', 'Session created successfully.'), 'success');
      e.target.reset();
      await loadSessions(); // Refresh sessions list
    }catch(err){
      console.error('createSession failed', err);
      showNotification(getTrainerDashboardText('trainer_dashboard.session_create_failed', 'Failed to create session: {message}', { message: err.message || err }), 'error');
    }
  }
})();
