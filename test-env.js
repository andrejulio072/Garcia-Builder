// Teste rápido das variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: './.env' });

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 'undefined');
console.log('STRIPE_SECRET_KEY (first 20 chars):', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'undefined');
console.log('STRIPE_PUBLISHABLE_KEY length:', process.env.STRIPE_PUBLISHABLE_KEY ? process.env.STRIPE_PUBLISHABLE_KEY.length : 'undefined');
console.log('All env vars related to STRIPE:');
Object.keys(process.env).forEach(key => {
    if (key.includes('STRIPE')) {
        console.log(`${key}: ${process.env[key] ? 'SET' : 'NOT SET'}`);
    }
});
console.log('=== FIM DO TESTE ===');
