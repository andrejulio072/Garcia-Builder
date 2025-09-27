/**
 * 🔍 VERIFICAÇÃO DE PAYMENT LINKS - GARCIA BUILDER
 * Este script ajuda a verificar se os Payment Links estão funcionando
 */

console.log('🔍 VERIFICAÇÃO DOS PAYMENT LINKS ATUAIS');
console.log('==========================================');

const currentLinks = {
    'Starter Plan (£75)': 'https://buy.stripe.com/7sY6oG8qsexmbXE000',
    'Beginner Plan (£95)': 'https://buy.stripe.com/6oU5kC7mobla2n4001',
    'Essentials Plan (£115)': 'https://buy.stripe.com/14A14m6ik74U9Pw002',
    'Full Plan (£155)': 'https://buy.stripe.com/bJe3cu5egbla7Hod003',
    'Elite Plan (£230)': 'https://buy.stripe.com/5kQdR85eg1KA1j04004'
};

console.log('\n📋 LINKS ATUAIS NO SISTEMA:');
Object.entries(currentLinks).forEach(([plan, link]) => {
    console.log(`${plan}: ${link}`);
});

console.log('\n⚠️  POSSÍVEIS PROBLEMAS:');
console.log('1. Payment Links podem estar inativos no Dashboard Stripe');
console.log('2. Links podem ter sido criados com configuração incorreta');
console.log('3. Payment Links podem ter expirado');

console.log('\n🔧 SOLUÇÕES:');
console.log('1. Acesse: https://dashboard.stripe.com/payment-links');
console.log('2. Verifique se os links estão "Active"');
console.log('3. Se não estão ativos, você precisa criar novos Payment Links');
console.log('4. Cada Payment Link deve ter:');
console.log('   - Produto/Preço configurado');
console.log('   - Tipo: Recurring (mensal)');
console.log('   - Status: Active');

console.log('\n🚨 PRÓXIMOS PASSOS:');
console.log('1. Vá para o Dashboard Stripe: https://dashboard.stripe.com/payment-links');
console.log('2. Verifique se os Payment Links existem e estão ativos');
console.log('3. Se não existem, crie novos seguindo o guia');
console.log('4. Copie os novos links e substitua no código');

console.log('\n✅ PARA CRIAR PAYMENT LINKS CORRETOS:');
console.log('1. Dashboard Stripe > Payment Links > Create Payment Link');
console.log('2. Selecione o produto (ou crie novo)');
console.log('3. Configure como "Recurring" (monthly)');
console.log('4. Ative o link');
console.log('5. Copie a URL que começa com https://buy.stripe.com/...');
