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
          <button class="btn btn-gold" onclick="handlePlanSelection('${key}', '${p.name}', '${p.price}')">${dict.cta?.choose || 'Choose Plan'}</button>
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
          processPlanPayment(autoPay, planData.name);
        } else {
          // Fallback: tentar processar com base no parâmetro
          processPlanPayment(autoPay, `Plan ${autoPay}`);
        }

        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    }
  });
  document.addEventListener('languageChanged', renderPricing);
})();

// Função para lidar com seleção de planos
function handlePlanSelection(planKey, planName, planPrice) {
  // Verificar se o usuário está logado
  const isLoggedIn = checkUserAuthentication(); // Esta função deve existir no auth.js

  if (!isLoggedIn) {
    // Salvar seleção do plano no localStorage
    localStorage.setItem('selectedPlan', JSON.stringify({
      key: planKey,
      name: planName,
      price: planPrice,
      timestamp: Date.now()
    }));

    // Redirecionar para login com parâmetro de retorno
    window.location.href = `login.html?action=register&return=payment&plan=${planKey}`;
    return;
  }

  // Se já estiver logado, processar pagamento direto
  processPlanPayment(planKey, planName);
}

// Função para verificar autenticação (placeholder - deve ser implementada no auth.js)
function checkUserAuthentication() {
  // Verificar se existe token ou session do usuário
  return localStorage.getItem('userToken') || sessionStorage.getItem('userSession');
}

// Função para processar pagamento
async function processPlanPayment(planKey, planName) {
  try {
    // Verificar se o Stripe está configurado
    if (typeof window.STRIPE_ENV_CONFIG === 'undefined') {
      console.error('Configurações Stripe não carregadas');
      alert('Erro de configuração. Tente novamente.');
      return;
    }

    const config = window.STRIPE_ENV_CONFIG;
    const priceId = config.priceIds[planKey];

    if (!priceId) {
      console.error('Price ID não encontrado para o plano:', planKey);
      alert('Erro no plano selecionado. Tente novamente.');
      return;
    }

    // Mostrar loading
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Processando...';
    button.disabled = true;

    // Criar sessão de checkout
    const response = await fetch(`${config.apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: priceId,
        planName: planName,
        userEmail: getUserEmail() // Esta função deve retornar o email do usuário logado
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro na criação da sessão de pagamento');
    }

    const { sessionId } = await response.json();

    // Redirecionar para Stripe Checkout
    const stripe = Stripe(config.publishableKey);
    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      throw new Error(result.error.message);
    }

  } catch (error) {
    console.error('Erro no pagamento:', error);
    alert(`Erro no pagamento: ${error.message}`);

    // Restaurar botão
    if (event && event.target) {
      event.target.textContent = originalText;
      event.target.disabled = false;
    }
  }
}

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
