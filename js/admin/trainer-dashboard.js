(function(){
  'use strict';

  let me = null;
  let clients = [];
  let selectedClient = null;
  let sessions = [];

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    me = await getCurrentUser();
    if(!me){
      const ret = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?redirect=${ret}`;
      return;
    }
    await loadClients();
    await loadSessions();
    bindUI();
  }

  async function getCurrentUser(){
    try{
      if (window.supabaseClient && window.supabaseClient.auth) {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
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
      const [{ data: metrics }, { data: prefs }] = await Promise.all([
        window.supabaseClient.from('body_metrics').select('*').eq('user_id', c.user_id).single(),
        window.supabaseClient.from('user_preferences').select('*').eq('user_id', c.user_id).single()
      ]);

      box.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-3">
          <img src="${c.avatar_url || 'assets/avatar-m1.svg'}" style="width:56px;height:56px;border-radius:50%"/>
          <div>
            <div class="h5 m-0">${c.full_name || 'Unnamed'}</div>
            <div class="text-muted">${c.email||''}</div>
          </div>
        </div>
        <div class="row g-2">
          <div class="col-md-4"><div class="p-2 card">Weight: <b>${metrics?.current_weight ?? '--'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Height: <b>${metrics?.height ?? '--'}</b></div></div>
          <div class="col-md-4"><div class="p-2 card">Units: <b>${prefs?.units ?? 'metric'}</b></div></div>
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

      showNotification(`Session marked as ${status}`, 'success');
    } catch (error) {
      console.error('Error updating session status:', error);
      showNotification('Failed to update session status', 'error');
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
      showNotification('Please select a client first', 'error');
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

      showNotification('Session created successfully', 'success');
      e.target.reset();
      await loadSessions(); // Refresh sessions list
    }catch(err){
      console.error('createSession failed', err);
      showNotification('Failed to create session: ' + (err.message||err), 'error');
    }
  }
})();
