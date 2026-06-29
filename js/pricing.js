// Pricing page specific JavaScript
(function() {
  const PLAN_ORDER = ['monthly', 'eight_week', 'twelve_week', 'eighteen_week'];

  const getPricingDict = () => {
    const lang = (window.GB_I18N && window.GB_I18N.getLang && window.GB_I18N.getLang()) || 'en';
    return (window.DICTS && window.DICTS[lang] && window.DICTS[lang].pricing)
      ? window.DICTS[lang].pricing
      : null;
  };

  function renderPricing() {
    const container = document.getElementById('pricingGrid');
    if (!container) return;

    const dict = getPricingDict();
    if (!dict) {
      setTimeout(renderPricing, 50);
      return;
    }

    container.innerHTML = PLAN_ORDER.map(key => {
      const plan = dict.plans?.[key];
      if (!plan) return '';

      const features = (plan.features || []).map(feature => `<li>${feature}</li>`).join('');
      const result = plan.result ? `<div class="result-band">${plan.result}</div>` : '';
      const meta = plan.meta ? `<div class="program-meta">${plan.meta}</div>` : '';
      const cardId = key.replace(/_/g, '-');

      return `
        <div id="${cardId}" class="price reveal ${plan.featured ? 'featured-plan' : ''}" data-tilt data-tilt-max="6" data-tilt-speed="500">
          ${plan.badge ? `<span class="save">${plan.badge}</span>` : ''}
          <h3>${plan.name}</h3>
          ${meta}
          <div class="tag">${plan.price}<span style="font-size:16px">${plan.period || ''}</span></div>
          ${result}
          <p class="muted">${plan.description || ''}</p>
          <ul>${features}</ul>
          <button class="btn btn-gold" data-plan-key="${key}" data-plan-name="${plan.name}" data-plan-price="${plan.price}">
            ${dict.cta?.choose || 'Start Now'}
          </button>
        </div>`;
    }).join('');

    if (window.VanillaTilt) {
      container.querySelectorAll('.price').forEach(el => {
        VanillaTilt.init(el, { max: 6, speed: 500, glare: false });
      });
    }

    if (window.CurrencyConverter && typeof window.CurrencyConverter.refresh === 'function') {
      window.CurrencyConverter.refresh();
    }

    container.querySelectorAll('.btn.btn-gold').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        const planKey = button.getAttribute('data-plan-key');
        const planName = button.getAttribute('data-plan-name');
        const planPrice = button.getAttribute('data-plan-price');

        if (typeof window.dataLayer !== 'undefined') {
          window.dataLayer.push({
            event: 'begin_checkout',
            plan_type: planKey,
            plan_name: planName,
            value: parseFloat((planPrice || '').replace(/[^0-9.]/g, '')) || 0,
            currency: 'EUR'
          });
        }

        if (typeof window.fbq !== 'undefined') {
          window.fbq('track', 'InitiateCheckout', {
            content_type: 'coaching_plan',
            content_name: planName,
            value: parseFloat((planPrice || '').replace(/[^0-9.]/g, '')) || 0,
            currency: 'EUR'
          });
        }

        handlePlanSelection(planKey, planName, planPrice, button);
      });
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15 });

    container.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  window.addEventListener('load', () => setTimeout(renderPricing, 100));
  document.addEventListener('languageChanged', renderPricing);
})();

async function handlePlanSelection(planKey, planName, planPrice, buttonElement) {
  const originalText = buttonElement ? buttonElement.textContent : '';
  const myPtHubUrl = buildMyPtHubCheckoutUrl(planKey, planName);

  if (myPtHubUrl) {
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'mypthub_checkout_redirect',
        plan_type: planKey,
        plan_name: planName,
        destination: 'mypthub',
        checkout_url: myPtHubUrl
      });
    }

    localStorage.setItem('selectedPlan', JSON.stringify({
      key: planKey,
      name: planName,
      price: planPrice,
      destination: 'mypthub',
      timestamp: Date.now()
    }));

    window.location.href = myPtHubUrl;
    return;
  }

  try {
    const customerEmail = await collectCheckoutEmail();
    if (!customerEmail) return;

    if (buttonElement) {
      buttonElement.textContent = 'Opening secure checkout...';
      buttonElement.disabled = true;
    }

    const config = window.STRIPE_ENV_CONFIG;
    if (!config || !config.apiUrl) {
      const subject = encodeURIComponent(`Coaching enquiry: ${planName}`);
      const body = encodeURIComponent(`Hi Andre,\n\nI want to start ${planName} (${planPrice}). Please send me the secure payment link and next steps.\n\nEmail: ${customerEmail}`);
      window.location.href = `mailto:andre@garciabuilder.fitness?subject=${subject}&body=${body}`;
      return;
    }

    const payload = {
      planKey,
      planName,
      customerEmail,
      customerName: getStoredUserName(),
      successUrl: `${window.location.origin}/success.html`,
      cancelUrl: `${window.location.origin}/pricing.html`,
      myPtHubInvite: document.querySelector('meta[name="mypthub:invite"]')?.getAttribute('content') || window.GB_MYPTHUB_INVITE || undefined,
      utm: getAttributionPayload()
    };

    localStorage.setItem('selectedPlan', JSON.stringify({
      key: planKey,
      name: planName,
      price: planPrice,
      customerEmail,
      timestamp: Date.now()
    }));
    localStorage.setItem('userEmail', customerEmail);

    const response = await fetch(`${config.apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      throw new Error(data.error?.message || data.message || 'Checkout is temporarily unavailable.');
    }

    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    alert((error && error.message) || 'Payment error. Please try again or contact Andre directly.');
  } finally {
    if (buttonElement) {
      buttonElement.textContent = originalText;
      buttonElement.disabled = false;
    }
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('gb_current_user') || 'null');
  } catch {
    return null;
  }
}

function getStoredUserName() {
  const user = getStoredUser();
  return user?.full_name || user?.name || '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

async function collectCheckoutEmail() {
  const user = getStoredUser();
  const stored = user?.email || localStorage.getItem('userEmail') || localStorage.getItem('gb_remember_user') || '';
  if (isValidEmail(stored)) return stored.trim();

  const email = window.prompt('Enter your best email to continue to secure checkout:');
  if (!email) return null;
  if (!isValidEmail(email)) {
    alert('Please enter a valid email address before checkout.');
    return null;
  }
  return email.trim();
}

function getAttributionPayload() {
  try {
    const saved = window.GB_ATTRIBUTION || JSON.parse(localStorage.getItem('gb_attrib_v1') || '{}');
    return {
      source: saved.utm_source,
      medium: saved.utm_medium,
      campaign: saved.utm_campaign,
      term: saved.utm_term,
      content: saved.utm_content,
      gclid: saved.gclid,
      fbclid: saved.fbclid
    };
  } catch {
    return {};
  }
}

function getMyPtHubPackageBaseUrl(planKey) {
  const metaByPlan = {
    monthly: 'mypthub:package:monthly',
    eight_week: 'mypthub:package:eight_week',
    twelve_week: 'mypthub:package:twelve_week',
    eighteen_week: 'mypthub:package:eighteen_week'
  };

  const cfg = window.GB_MYPTHUB_PACKAGES;
  if (cfg && typeof cfg === 'object' && typeof cfg[planKey] === 'string' && cfg[planKey].trim()) {
    return cfg[planKey].trim();
  }

  const metaName = metaByPlan[planKey];
  if (!metaName) return '';

  const fromMeta = document.querySelector(`meta[name="${metaName}"]`)?.getAttribute('content');
  return (fromMeta || '').trim();
}

function buildMyPtHubCheckoutUrl(planKey, planName) {
  const baseUrl = getMyPtHubPackageBaseUrl(planKey);
  if (!baseUrl) return '';

  let parsed;
  try {
    parsed = new URL(baseUrl, window.location.origin);
  } catch {
    return '';
  }

  const attrib = getAttributionPayload();
  const params = parsed.searchParams;

  params.set('utm_source', attrib.source || 'website');
  params.set('utm_medium', attrib.medium || 'pricing_page');
  params.set('utm_campaign', attrib.campaign || 'mypthub_package_checkout');
  params.set('utm_content', attrib.content || planKey);
  if (attrib.term) params.set('utm_term', attrib.term);
  if (attrib.gclid) params.set('gclid', attrib.gclid);
  if (attrib.fbclid) params.set('fbclid', attrib.fbclid);

  params.set('plan_key', planKey);
  params.set('plan_name', planName || planKey);

  return parsed.toString();
}
