// Pricing page specific JavaScript
(function() {
  function renderPricing(){
    const container = document.getElementById('pricingGrid');
    if (!container) return;

    const lang = (window.GB_I18N && window.GB_I18N.getLang && window.GB_I18N.getLang()) || 'en';
    const dict = (window.DICTS && window.DICTS[lang] && window.DICTS[lang].pricing) ? window.DICTS[lang].pricing : null;
    if (!dict) { setTimeout(renderPricing, 50); return; }

    const plans = dict.plans;
    const order = ['starter','beginner','essentials','full','elite'];
    container.innerHTML = order.map(key => {
      const p = plans[key]; if (!p) return '';
      const features = (p.features||[]).map(f=>`<li>${f}</li>`).join('');
      return `
        <div class="price reveal" data-tilt data-tilt-max="6" data-tilt-speed="500">
          ${p.badge ? `<span class=\"save\">${p.badge}</span>` : ''}
          <h3>${p.name}</h3>
          <div class="tag">${p.price}<span style="font-size:16px">${p.period}</span></div>
          <ul>${features}</ul>
          <p class="muted">${p.description || ''}</p>
          <button class="btn btn-gold" data-plan-key="${key}" data-plan-name="${p.name}" data-plan-price="${p.price}">${dict.cta?.choose || 'Choose Plan'}</button>
        </div>`;
    }).join('');

    // Initialize tilt
    if (window.VanillaTilt) {
      container.querySelectorAll('.price').forEach(el => {
        VanillaTilt.init(el, { max: 6, speed: 500, glare: false });
      });
    }

    // Initialize tilt for member discount card
    const memberDiscountCard = document.querySelector('.member-discount');
    if (memberDiscountCard && window.VanillaTilt) {
      VanillaTilt.init(memberDiscountCard, { max: 4, speed: 500, glare: false });
    }

    // Add event listeners to plan buttons
    container.querySelectorAll('.btn.btn-gold').forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const planKey = this.getAttribute('data-plan-key');
        const planName = this.getAttribute('data-plan-name');
        const planPrice = this.getAttribute('data-plan-price');
        handlePlanSelection(planKey, planName, planPrice, this);
      });
    });

    // Reveal animation
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });
    container.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Also observe member discount card for reveal animation
    if (memberDiscountCard) {
      io.observe(memberDiscountCard);
    }
  }

  window.addEventListener('load', () => {
    setTimeout(renderPricing, 100);

    // Verificar se há auto-pagamento após login/registro
    const urlParams = new URLSearchParams(window.location.search);
    const autoPay = urlParams.get('auto-pay');
    if (autoPay) {
      // Aguardar um pouco para a página carregar completamente
      setTimeout(() => {
        const planData = getStoredPlanData();
        if (planData && planData.key === autoPay) {
          handlePlanSelection(autoPay, planData.name, planData.price);
        } else {
          // Fallback: tentar processar com base no parâmetro
          handlePlanSelection(autoPay, `Plan ${autoPay}`, '');
        }

        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    }
  });
  document.addEventListener('languageChanged', renderPricing);
})();

// Função para lidar com seleção de planos
async function handlePlanSelection(planKey, planName, planPrice, buttonElement) {
  try {
    // Attach any active discount (applied at checkout only)
    let activeDiscount = null;
    try {
      activeDiscount = JSON.parse(localStorage.getItem('active-discount') || 'null');
    } catch {}

    // 1) Opção 1: Payment Links (sem backend)
    if (window.PAYMENT_LINKS && window.PAYMENT_LINKS[planKey]) {
      // feedback opcional no botão
      if (buttonElement) {
        const original = buttonElement.textContent;
        buttonElement.textContent = 'Opening checkout...';
        buttonElement.disabled = true;
        setTimeout(() => {
          buttonElement.textContent = original;
          buttonElement.disabled = false;
        }, 2000);
      }
      // abre o Stripe Payment Link (página hospedada pelo Stripe)
      let url = window.PAYMENT_LINKS[planKey];
      if (activeDiscount && activeDiscount.code) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}discount=${encodeURIComponent(activeDiscount.code)}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // 2) Fallback (só será usado se um dia você ativar backend serverless)
    if (typeof window.STRIPE_ENV_CONFIG === 'undefined') {
      console.error('Stripe config not loaded and no Payment Link found.');
      alert('Payment temporarily unavailable. Please try again later.');
      return;
    }

    const config = window.STRIPE_ENV_CONFIG;
    let originalText = '';
    if (buttonElement) {
      originalText = buttonElement.textContent;
      buttonElement.textContent = 'Processing...';
      buttonElement.disabled = true;
    }

    const response = await fetch(`${config.apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planKey: planKey,
        planName: planName,
        customerEmail: getUserEmail && getUserEmail(),
        successUrl: window.location.origin + '/success.html',
        cancelUrl: window.location.origin + '/pricing.html',
        discountCode: activeDiscount?.code || undefined
      })
    });

    if (!response.ok) throw new Error('Failed to create checkout session');
    const data = await response.json();
    if (!data || !data.url) throw new Error('Invalid session response');

    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    alert('Payment error: ' + (error.message || 'unknown'));
  } finally {
    if (buttonElement) {
      buttonElement.disabled = false;
    }
  }
}

// Função para verificar autenticação (placeholder - deve ser implementada no auth.js)
function checkUserAuthentication() {
  // Verificar se existe token ou session do usuário
  return localStorage.getItem('userToken') || sessionStorage.getItem('userSession');
}

// Legacy function removed - now using direct Payment Links

// Função para obter email do usuário
function getUserEmail() {
  // Tentar pegar do usuário logado
  const currentUser = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
  if (currentUser && currentUser.email) {
    return currentUser.email;
  }

  // Fallback para email armazenado
  return localStorage.getItem('userEmail') || 'usuario@garciabuildre.com';
}

// Função para obter dados do plano armazenado
function getStoredPlanData() {
  const stored = localStorage.getItem('selectedPlan');
  if (stored) {
    try {
      const planData = JSON.parse(stored);
      // Verificar se não está muito antigo (1 hora)
      if (Date.now() - planData.timestamp < 3600000) {
        return planData;
      }
      localStorage.removeItem('selectedPlan');
    } catch (e) {
      localStorage.removeItem('selectedPlan');
    }
  }
  return null;
}

// Implementar verificação de autenticação real
function checkUserAuthentication() {
  const currentUser = JSON.parse(localStorage.getItem('gb_current_user') || 'null');
  return currentUser !== null;
}
