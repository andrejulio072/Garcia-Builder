// Configuração de ambiente para Stripe
const STRIPE_CONFIG = {
    development: {
        // Chave de teste pública do Stripe
        publishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
        apiUrl: 'http://localhost:3001/api',
        // Usando preços dinâmicos no servidor - não precisamos de Price IDs fixos
        plans: {
            starter: { name: 'Starter Plan', price: '£75', amount: 7500 },
            beginner: { name: 'Beginner Plan', price: '£95', amount: 9500 },
            essentials: { name: 'Essentials Plan', price: '£115', amount: 11500 },
            full: { name: 'Full Plan', price: '£155', amount: 15500 },
            elite: { name: 'Elite Plan', price: '£230', amount: 23000 }
        }
    },
    production: {
        publishableKey: 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT',
        apiUrl: 'https://seudominio.com/api',
        plans: {
            starter: { name: 'Starter Plan', price: '£75', amount: 7500 },
            beginner: { name: 'Beginner Plan', price: '£95', amount: 9500 },
            essentials: { name: 'Essentials Plan', price: '£115', amount: 11500 },
            full: { name: 'Full Plan', price: '£155', amount: 15500 },
            elite: { name: 'Elite Plan', price: '£230', amount: 23000 }
        }
    }
};

// Detectar ambiente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const currentConfig = isDevelopment ? STRIPE_CONFIG.development : STRIPE_CONFIG.production;

// Exportar configuração
window.STRIPE_ENV_CONFIG = currentConfig;

console.log('Stripe Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API URL:', currentConfig.apiUrl);
