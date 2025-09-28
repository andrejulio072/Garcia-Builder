(function(){
  'use strict';

  let me = null;
  let clients = [];
  let selectedClient = null;

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    me = await getCurrentUser();
    if(!me){
      const ret = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?redirect=${ret}`;
      return;
    }
    await loadClients();
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

  async function createSession(e){
    e.preventDefault();
    if (!selectedClient){
      alert('Select a client first');
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
      alert('Session created');
      e.target.reset();
    }catch(err){
      console.error('createSession failed', err);
      alert('Failed to create session: ' + (err.message||err));
    }
  }
})();
