// Configuração Stripe seguindo documentação oficial - VERSÃO PREMIUM
// Seleciona automaticamente a API base: localhost no dev, same-origin em produção (Render/domínio).
const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE = isLocalhost ? 'http://localhost:3001/api' : '/api';

const STRIPE_CONFIG = {
    // Usando chave pública LIVE para produção (chave pública pode estar no front com segurança)
    publishableKey: 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT',
    apiUrl: API_BASE,
    plans: {
        starter: { name: 'Starter Coaching', price: '£79', amount: 7900 },
        consistency: { name: 'Consistency Plan', price: '£99', amount: 9900 },
        performance: { name: 'Performance Base', price: '£125', amount: 12500 },
        premium: { name: 'Coaching Premium', price: '£165', amount: 16500 },
        elite: { name: 'Elite Mastery', price: '£235', amount: 23500 }
    }
};

// Usar configuração test (recomendado pela documentação para desenvolvimento)
const currentConfig = STRIPE_CONFIG;

// Exportar configuração
window.STRIPE_ENV_CONFIG = currentConfig;

console.log('[Stripe] Environment:', isLocalhost ? 'development (localhost)' : 'production (same-origin)');
console.log('[Stripe] API URL:', currentConfig.apiUrl);
console.log('[Stripe] Publishable Key:', currentConfig.publishableKey.substring(0, 20) + '...');
