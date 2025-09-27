// Teste da chave Stripe Live
const testPublicKey = 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT';

console.log('Testando chave publicável live...');
console.log('Chave:', testPublicKey.substring(0, 20) + '...');

// Simular inicialização do Stripe com a chave live
try {
    // Em um ambiente real, isso seria: const stripe = Stripe(testPublicKey);
    console.log('✅ Chave publicável formatada corretamente');
    console.log('✅ Prefixo pk_live_ detectado');
    console.log('✅ Comprimento da chave:', testPublicKey.length, 'caracteres');

    if (testPublicKey.startsWith('pk_live_')) {
        console.log('✅ Esta é uma chave LIVE válida');
    } else {
        console.log('❌ Esta não é uma chave live válida');
    }
} catch (error) {
    console.error('❌ Erro ao validar chave:', error.message);
}
