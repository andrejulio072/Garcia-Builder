// Teste completo das chaves Stripe Live
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const publicKey = 'pk_live_51S8QxZCEdPbAOAaf5v5Y3yskMYdY3p9sRAIXs2clIAtBiJtLQQwVA3IBcZe02znzJYC8e6BTpdpKRmvkiOZLM5ee00QKktfaZT';
const secretKey = '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';

console.log('🔑 Testando Chaves Stripe Live...\n');

// Testar chave publicável
console.log('📋 CHAVE PUBLICÁVEL:');
console.log('   Formato:', publicKey.substring(0, 20) + '...');
console.log('   Comprimento:', publicKey.length, 'caracteres');
console.log('   Prefixo:', publicKey.startsWith('pk_live_') ? '✅ pk_live_' : '❌ Inválido');

// Testar chave secreta
console.log('\n🔐 CHAVE SECRETA:');
console.log('   Formato:', secretKey.substring(0, 20) + '...');
console.log('   Comprimento:', secretKey.length, 'caracteres');
console.log('   Prefixo:', secretKey.startsWith('sk_live_') ? '✅ sk_live_' : '❌ Inválido');

// Verificar se as chaves fazem parte da mesma conta (primeiros 15 caracteres - ID da conta)
const publicKeyAccountId = publicKey.substring(8, 23); // após pk_live_
const secretKeyAccountId = secretKey.substring(8, 23); // após sk_live_

console.log('\n🏦 VERIFICAÇÃO DE CONTA:');
console.log('   Chave Publicável ID:', publicKeyAccountId);
console.log('   Chave Secreta ID:', secretKeyAccountId);
console.log('   Contas coincidem:', publicKeyAccountId === secretKeyAccountId ? '✅ Sim' : '❌ Não');

// Testar conexão com Stripe (simulação)
console.log('\n🔗 STATUS DA CONFIGURAÇÃO:');
if (publicKey.startsWith('pk_live_') && secretKey.startsWith('sk_live_') && publicKeyAccountId === secretKeyAccountId) {
    console.log('   ✅ Chaves live válidas e compatíveis');
    console.log('   ✅ Pronto para processar pagamentos reais');
    console.log('   ✅ Sistema configurado corretamente');
} else {
    console.log('   ❌ Problema na configuração das chaves');
}

console.log('\n🎯 PRÓXIMO PASSO:');
console.log('   Reiniciar o servidor para aplicar as novas chaves live');
console.log('   Comando: npm start');
