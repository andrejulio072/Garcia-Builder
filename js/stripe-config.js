// Configuração de ambiente para Stripe
const STRIPE_CONFIG = {
    development: {
        publishableKey: 'pk_test_51...', // Substitua pela sua chave de teste
        apiUrl: 'http://localhost:3001/api',
        priceIds: {
            starter: 'price_1234567890_starter_test',
            beginner: 'price_1234567890_beginner_test',
            essentials: 'price_1234567890_essentials_test',
            full: 'price_1234567890_full_test',
            elite: 'price_1234567890_elite_test'
        }
    },
    production: {
        publishableKey: 'pk_live_51...', // Substitua pela sua chave de produção
        apiUrl: 'https://seudominio.com/api',
        priceIds: {
            starter: 'price_1234567890_starter_live',
            beginner: 'price_1234567890_beginner_live',
            essentials: 'price_1234567890_essentials_live',
            full: 'price_1234567890_full_live',
            elite: 'price_1234567890_elite_live'
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