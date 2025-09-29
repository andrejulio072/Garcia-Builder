// Diagnóstico completo do erro "Failed to fetch"
const https = require('https');
const http = require('http');

console.log('🔍 Diagnóstico do erro "Failed to fetch"\n');

// Teste 1: Verificar se o servidor está respondendo
async function testServerHealth() {
    console.log('1. Testando saúde do servidor...');

    try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
            const data = await response.text();
            console.log('   ✅ Servidor respondendo:', data);
        } else {
            console.log('   ❌ Servidor retornou:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('   ❌ Erro ao conectar no servidor:', error.message);
        console.log('   🔧 Possível causa: Servidor não está rodando na porta 3001');
    }
}

// Teste 2: Testar endpoint de checkout
async function testCheckoutEndpoint() {
    console.log('\n2. Testando endpoint de checkout...');

    const testPayload = {
        planKey: 'starter',
        planName: 'Starter Plan',
        customerEmail: 'teste@diagnostico.com',
        successUrl: 'http://localhost:3001/success.html',
        cancelUrl: 'http://localhost:3001/pricing.html'
    };

    try {
        const response = await fetch('http://localhost:3001/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Endpoint funcionando. Session ID:', data.sessionId?.substring(0, 20) + '...');
        } else {
            const errorText = await response.text();
            console.log('   ❌ Erro no endpoint:', response.status, response.statusText);
            console.log('   📝 Resposta:', errorText);
        }
    } catch (error) {
        console.log('   ❌ Erro na requisição:', error.message);

        // Diagnósticos específicos
        if (error.message.includes('fetch is not defined')) {
            console.log('   🔧 Possível causa: Node.js versão antiga sem fetch nativo');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('   🔧 Possível causa: Servidor não está rodando');
        } else if (error.message.includes('CORS')) {
            console.log('   🔧 Possível causa: Problema de CORS');
        }
    }
}

// Teste 3: Verificar variáveis de ambiente
function testEnvironmentVariables() {
    console.log('\n3. Verificando variáveis de ambiente...');

    const requiredVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
        'PORT',
        'NODE_ENV'
    ];

    requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
            const displayValue = varName.includes('KEY') ?
                value.substring(0, 20) + '...' : value;
            console.log(`   ✅ ${varName}: ${displayValue}`);
        } else {
            console.log(`   ❌ ${varName}: NÃO DEFINIDA`);
        }
    });
}

// Teste 4: Verificar conexão com Stripe
async function testStripeConnection() {
    console.log('\n4. Testando conexão com Stripe...');

    try {
        // Simular uma chamada do Stripe
        console.log('   ⏳ Verificando se as chaves Stripe são válidas...');

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Teste simples - listar eventos recentes
        const events = await stripe.events.list({ limit: 1 });
        console.log('   ✅ Conexão com Stripe OK - API respondendo');

    } catch (error) {
        console.log('   ❌ Erro na conexão com Stripe:', error.message);

        if (error.message.includes('Invalid API Key')) {
            console.log('   🔧 Possível causa: Chave secreta inválida ou expirada');
        } else if (error.message.includes('No such')) {
            console.log('   🔧 Possível causa: Recurso não encontrado no Stripe');
        }
    }
}

// Executar todos os testes
async function runDiagnostics() {
    console.log('🚀 Iniciando diagnóstico completo...\n');

    testEnvironmentVariables();
    await testServerHealth();
    await testCheckoutEndpoint();
    await testStripeConnection();

    console.log('\n🔍 Diagnóstico concluído!');
    console.log('\n💡 Se o problema persistir, verifique:');
    console.log('   1. Se o servidor está rodando (npm start)');
    console.log('   2. Se não há firewall bloqueando a porta 3001');
    console.log('   3. Se as chaves do Stripe estão corretas');
    console.log('   4. Se o navegador não está bloqueando requisições');
}

// Carregar variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Executar diagnóstico
runDiagnostics().catch(console.error);
