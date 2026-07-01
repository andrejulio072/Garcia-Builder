// Configuração Stripe seguindo documentação oficial - VERSÃO PREMIUM
// Seleciona automaticamente a API base: localhost no dev, same-origin em produção (Render/domínio).
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = isLocalhost ? 'http://localhost:3001/api' : '/api';

const STRIPE_CONFIG = {
    // Usando chave pública LIVE para produção (chave pública pode estar no front com segurança)
    publishableKey: 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT',
    apiUrl: API_BASE,
    plans: {
        monthly: { name: 'Monthly Online Client', price: '£150', amount: 15000, mode: 'subscription' },
        eight_week: { name: '8-Week Rebuild Programme', price: '£275', amount: 27500, mode: 'payment' },
        twelve_week: { name: '12-Week Transformation Programme', price: '£400', amount: 40000, mode: 'payment' },
        eighteen_week: { name: '18-Week Premium Transformation', price: '£600', amount: 60000, mode: 'payment' }
    }
};

// Usar configuração test (recomendado pela documentação para desenvolvimento)
const currentConfig = STRIPE_CONFIG;

// Exportar configuração
window.STRIPE_ENV_CONFIG = currentConfig;

console.log('[Stripe] Environment:', isLocalhost ? 'development (localhost)' : 'production (same-origin)');
console.log('[Stripe] API URL:', currentConfig.apiUrl);
console.log('[Stripe] Publishable Key:', currentConfig.publishableKey.substring(0, 20) + '...');
