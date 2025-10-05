// Simple Consent Banner for Google Consent Mode v2
(function(){
  if (window.__CONSENT_BANNER_INIT__) return; window.__CONSENT_BANNER_INIT__=true;
  const KEY='gb_consent_v1';
  const stored = safeParse(localStorage.getItem(KEY));
  if (stored && (stored.status==='granted' || stored.status==='denied')) {
    // Already decided; allow reopening via window.openConsentPreferences()
    window.openConsentPreferences = renderPanel; return;
  }
  renderBanner();

  function safeParse(v){try{return JSON.parse(v);}catch(_){return null}}

  function consentUpdate(status, granular){
    const base = {
      ad_storage: status==='granted' ? 'granted':'denied',
      analytics_storage: status==='granted' ? 'granted':'denied',
      ad_user_data: status==='granted' ? 'granted':'denied',
      ad_personalization: status==='granted' ? 'granted':'denied',
      functionality_storage:'granted',
      security_storage:'granted'
    };
    // If granular toggles present override
    if (granular) Object.assign(base, granular);
    if (typeof gtag==='function') { gtag('consent','update', base); }
    const payload={status, updated_at:new Date().toISOString(), choices:base, version:1};
    localStorage.setItem(KEY, JSON.stringify(payload));
    dispatchEvent(new CustomEvent('consent_update', {detail:payload}));
  }

  function renderBanner(){
    const div=document.createElement('div');
    div.id='consent-banner';
    div.innerHTML=`<div class="cb-wrapper"><div class="cb-box"><h4>Cookies & Tracking</h4><p>Usamos cookies para métricas (GA4) e anúncios (Google Ads / Meta). Você pode aceitar tudo ou recusar. Pode mudar depois.</p><div class="cb-actions"><button id="cb-accept" class="cb-btn primary">Aceitar Tudo</button><button id="cb-reject" class="cb-btn">Rejeitar</button><button id="cb-custom" class="cb-link">Personalizar</button></div></div></div>`;
    document.body.appendChild(div);
    style();
    document.getElementById('cb-accept').onclick=()=>{consentUpdate('granted'); remove(div);};
    document.getElementById('cb-reject').onclick=()=>{consentUpdate('denied'); remove(div);};
    document.getElementById('cb-custom').onclick=()=>{remove(div); renderPanel();};
  }

  function renderPanel(){
    if (document.getElementById('consent-panel')) return;
    const wrap=document.createElement('div');
    wrap.id='consent-panel';
    const current=safeParse(localStorage.getItem(KEY));
    const granted=current?.choices||{};
    wrap.innerHTML=`<div class="cp-wrapper"><div class="cp-box"><div class="cp-head"><h4>Preferências de Cookies</h4><button id="cp-close" aria-label="Fechar">✕</button></div><form id="cp-form"><label class="cp-row"><input type="checkbox" data-k="analytics_storage" ${granted.analytics_storage==='granted'?'checked':''}/> Analytics</label><label class="cp-row"><input type="checkbox" data-k="ad_storage" ${granted.ad_storage==='granted'?'checked':''}/> Anúncios (Ad Storage)</label><label class="cp-row"><input type="checkbox" data-k="ad_user_data" ${granted.ad_user_data==='granted'?'checked':''}/> Ads User Data</label><label class="cp-row"><input type="checkbox" data-k="ad_personalization" ${granted.ad_personalization==='granted'?'checked':''}/> Personalização de Anúncios</label><div class="cp-actions"><button type="button" id="cp-save" class="cb-btn primary">Salvar</button><button type="button" id="cp-cancel" class="cb-btn">Cancelar</button></div><small class="cp-note">Funcionais e segurança sempre ativos.</small></form></div></div>`;
    document.body.appendChild(wrap); style();
    document.getElementById('cp-close').onclick=()=>remove(wrap);
    document.getElementById('cp-cancel').onclick=()=>remove(wrap);
    document.getElementById('cp-save').onclick=()=>{
      const checks=[...wrap.querySelectorAll('input[type=checkbox][data-k]')];
      const granular={};
      let anyGranted=false; checks.forEach(ch=>{granular[ch.dataset.k]=ch.checked?'granted':'denied'; if(ch.checked) anyGranted=true;});
      consentUpdate(anyGranted?'granted':'denied', granular); remove(wrap);
    };
  }

  function remove(el){ if(el && el.parentNode) el.parentNode.removeChild(el); }

  function style(){
    if (document.getElementById('consent-style')) return;
    const s=document.createElement('style'); s.id='consent-style'; s.textContent=`#consent-banner .cb-wrapper{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;z-index:9999;font-family:Inter,system-ui,sans-serif;}#consent-banner .cb-box{pointer-events:auto;margin:0 0 16px;max-width:560px;background:#111d28;color:#fff;border:1px solid #243341;border-radius:14px;padding:20px 22px;box-shadow:0 12px 40px -8px rgba(0,0,0,.5);}#consent-banner h4{margin:0 0 8px;font-size:18px;font-weight:700;background:linear-gradient(90deg,#fff,#dfe7ef);-webkit-background-clip:text;color:transparent;}#consent-banner p{margin:0 0 14px;line-height:1.45;font-size:14px;color:#d0d6dc;} .cb-actions{display:flex;gap:10px;flex-wrap:wrap} .cb-btn{background:#2a3b49;color:#fff;border:1px solid #2f4858;padding:8px 16px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;transition:.18s} .cb-btn:hover{background:#345062} .cb-btn.primary{background:#F6C84E;color:#111;font-weight:700;border-color:#e0b845} .cb-btn.primary:hover{background:#ffd052} .cb-link{background:none;border:none;color:#8bb4ff;cursor:pointer;font-size:13px;text-decoration:underline;padding:0;margin-left:auto}#consent-panel .cp-wrapper{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:10000;font-family:Inter,system-ui,sans-serif;}#consent-panel .cp-box{background:#0f1822;color:#fff;border:1px solid #22303d;padding:28px 30px;max-width:480px;width:100%;border-radius:16px;box-shadow:0 12px 42px -6px rgba(0,0,0,.55);}#consent-panel .cp-head{display:flex;align-items:center;justify-content:space-between;margin:0 0 12px}#consent-panel h4{margin:0;font-size:20px;font-weight:700;background:linear-gradient(90deg,#fff,#dfe7ef);-webkit-background-clip:text;color:transparent;}#consent-panel button#cp-close{background:none;border:none;color:#8aa2b5;font-size:18px;cursor:pointer;line-height:1}#consent-panel .cp-row{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px;}#consent-panel .cp-actions{display:flex;gap:10px;margin-top:14px}#consent-panel .cp-note{display:block;margin-top:12px;font-size:11px;color:#93a4b2;opacity:.85}#consent-panel .cb-btn{background:#2a3b49;color:#fff;border:1px solid #2f4858;padding:8px 16px;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600;transition:.18s}#consent-panel .cb-btn.primary{background:#F6C84E;color:#111;font-weight:700;border-color:#e0b845}#consent-panel .cb-btn.primary:hover{background:#ffd052}#consent-panel .cb-btn:hover{background:#345062}`;document.head.appendChild(s);
  }

  // Expose reopen method (for footer link)
  window.openConsentPreferences = renderPanel;
})();