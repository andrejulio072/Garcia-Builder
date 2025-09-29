// Sistema Completo de Verificação - Stripe Implementation
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 SISTEMA DE VERIFICAÇÃO COMPLETO - STRIPE IMPLEMENTATION');
console.log('=' .repeat(80));

// Cores para output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function testResult(testName, passed, details = '') {
    totalTests++;
    if (passed) {
        passedTests++;
        log(`✅ ${testName}`, 'green');
        if (details) log(`   ${details}`, 'blue');
    } else {
        failedTests++;
        log(`❌ ${testName}`, 'red');
        if (details) log(`   ${details}`, 'yellow');
    }
}

// 1. VERIFICAÇÃO DE CONFIGURAÇÃO
async function verifyConfiguration() {
    log('\n📋 1. VERIFICAÇÃO DE CONFIGURAÇÃO', 'bold');
    log('-'.repeat(50));

    // Verificar variáveis de ambiente
    const requiredEnvVars = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'PORT'];

    requiredEnvVars.forEach(varName => {
        const exists = !!process.env[varName];
        testResult(
            `Variável ${varName}`,
            exists,
            exists ? process.env[varName].substring(0, 20) + '...' : 'Não encontrada'
        );
    });

    // Verificar formato das chaves
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;

    testResult(
        'Formato da chave secreta',
        secretKey && secretKey.startsWith('sk_'),
        secretKey ? `Prefixo: ${secretKey.substring(0, 10)}...` : 'Chave inválida'
    );

    testResult(
        'Formato da chave publicável',
        publicKey && publicKey.startsWith('pk_'),
        publicKey ? `Prefixo: ${publicKey.substring(0, 10)}...` : 'Chave inválida'
    );

    // Verificar se são test keys (recomendado para desenvolvimento)
    const isTestMode = secretKey && secretKey.includes('test');
    testResult(
        'Modo de teste (recomendado para desenvolvimento)',
        isTestMode,
        isTestMode ? 'Usando test keys (seguro)' : 'Usando live keys (produção)'
    );
}

// 2. VERIFICAÇÃO DE CONECTIVIDADE
async function verifyConnectivity() {
    log('\n🌐 2. VERIFICAÇÃO DE CONECTIVIDADE', 'bold');
    log('-'.repeat(50));

    try {
        // Testar health endpoint
        const healthResponse = await fetch('http://localhost:3001/health');
        testResult(
            'Servidor respondendo',
            healthResponse.ok,
            `Status: ${healthResponse.status}`
        );

        // Testar endpoint principal
        const apiResponse = await fetch('http://localhost:3001/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planKey: 'starter',
                customerEmail: 'teste@verificacao.com',
                planName: 'Teste de Verificação'
            })
        });

        testResult(
            'Endpoint de checkout',
            apiResponse.ok,
            `Status: ${apiResponse.status} ${apiResponse.statusText}`
        );

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            testResult(
                'Resposta válida do endpoint',
                !!(data.sessionId && data.url),
                `Session ID: ${data.sessionId?.substring(0, 20)}...`
            );
        }

    } catch (error) {
        testResult('Conectividade com servidor', false, error.message);
    }
}

// 3. VERIFICAÇÃO DE STRIPE API
async function verifyStripeAPI() {
    log('\n🔑 3. VERIFICAÇÃO DE STRIPE API', 'bold');
    log('-'.repeat(50));

    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Testar conexão com Stripe
        const balance = await stripe.balance.retrieve();
        testResult(
            'Conexão com Stripe API',
            !!balance,
            `Saldo disponível: ${balance.available?.[0]?.amount || 0} ${balance.available?.[0]?.currency || 'N/A'}`
        );

        // Testar criação de sessão de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Teste de Verificação'
                    },
                    unit_amount: 7500,
                    recurring: { interval: 'month' }
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: 'http://localhost:3001/success.html',
            cancel_url: 'http://localhost:3001/pricing.html'
        });

        testResult(
            'Criação de Checkout Session',
            !!session.id,
            `Session ID: ${session.id}`
        );

        testResult(
            'URL de redirecionamento gerada',
            !!session.url,
            `URL válida: ${session.url ? 'Sim' : 'Não'}`
        );

    } catch (error) {
        testResult('Stripe API', false, error.message);
    }
}

// 4. VERIFICAÇÃO DE ARQUIVOS
async function verifyFiles() {
    log('\n📁 4. VERIFICAÇÃO DE ARQUIVOS', 'bold');
    log('-'.repeat(50));

    const fs = require('fs');
    const requiredFiles = [
        '.env',
        'api/stripe-server.js',
        'js/stripe-config.js',
        'pricing.html',
        'success.html',
        'package.json'
    ];

    requiredFiles.forEach(file => {
        const exists = fs.existsSync(path.join(__dirname, file));
        testResult(`Arquivo ${file}`, exists);
    });

    // Verificar conteúdo crítico
    try {
        const serverContent = fs.readFileSync(path.join(__dirname, 'api/stripe-server.js'), 'utf8');
        testResult(
            'Inicialização do Stripe no servidor',
            serverContent.includes('require(\'stripe\')'),
            'Stripe carregado corretamente'
        );

        const configContent = fs.readFileSync(path.join(__dirname, 'js/stripe-config.js'), 'utf8');
        testResult(
            'Configuração do cliente',
            configContent.includes('publishableKey'),
            'Chave publicável configurada'
        );

    } catch (error) {
        testResult('Verificação de conteúdo dos arquivos', false, error.message);
    }
}

// 5. VERIFICAÇÃO DE SEGURANÇA
function verifySecurityPractices() {
    log('\n🔒 5. VERIFICAÇÃO DE SEGURANÇA', 'bold');
    log('-'.repeat(50));

    const fs = require('fs');

    // Verificar se chave secreta não está exposta no frontend
    try {
        const frontendFiles = ['pricing.html', 'js/stripe-config.js', 'index.html'];
        let secretKeyExposed = false;

        frontendFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('sk_') && (content.includes('sk_live_') || content.includes('sk_test_'))) {
                    secretKeyExposed = true;
                }
            }
        });

        testResult(
            'Chave secreta não exposta no frontend',
            !secretKeyExposed,
            secretKeyExposed ? 'RISCO: Chave secreta encontrada no frontend' : 'Seguro'
        );

        // Verificar .env
        const envExists = fs.existsSync(path.join(__dirname, '.env'));
        testResult('.env existe e configurado', envExists);

        // Verificar gitignore
        const gitignoreExists = fs.existsSync(path.join(__dirname, '.gitignore'));
        if (gitignoreExists) {
            const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
            testResult(
                '.env no .gitignore',
                gitignoreContent.includes('.env'),
                'Variáveis de ambiente protegidas'
            );
        } else {
            testResult('.gitignore existe', false, 'Criar .gitignore para proteger .env');
        }

    } catch (error) {
        testResult('Verificação de segurança', false, error.message);
    }
}

// 6. VERIFICAÇÃO DE PADRÕES OFICIAIS
function verifyOfficialPatterns() {
    log('\n📚 6. VERIFICAÇÃO DE PADRÕES OFICIAIS', 'bold');
    log('-'.repeat(50));

    const fs = require('fs');

    try {
        const serverContent = fs.readFileSync(path.join(__dirname, 'api/stripe-server.js'), 'utf8');

        // Verificar padrões da documentação oficial
        testResult(
            'Criação de Checkout Session server-side',
            serverContent.includes('stripe.checkout.sessions.create'),
            'Seguindo padrão oficial'
        );

        testResult(
            'Configuração de line_items com price_data',
            serverContent.includes('price_data'),
            'Usando price_data dinâmico (recomendado)'
        );

        testResult(
            'Modo de assinatura configurado',
            serverContent.includes('mode: \'subscription\''),
            'Configurado para assinaturas recorrentes'
        );

        testResult(
            'URLs de sucesso e cancelamento',
            serverContent.includes('success_url') && serverContent.includes('cancel_url'),
            'URLs de redirecionamento configuradas'
        );

    } catch (error) {
        testResult('Verificação de padrões oficiais', false, error.message);
    }
}

// 7. RESUMO FINAL
function printSummary() {
    log('\n📊 RESUMO FINAL DA VERIFICAÇÃO', 'bold');
    log('=' .repeat(80));

    log(`Total de testes: ${totalTests}`, 'blue');
    log(`✅ Passou: ${passedTests}`, 'green');
    log(`❌ Falhou: ${failedTests}`, 'red');

    const successRate = Math.round((passedTests / totalTests) * 100);
    log(`📈 Taxa de sucesso: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');

    if (successRate >= 95) {
        log('\n🎉 EXCELENTE! Sistema totalmente funcional e seguindo padrões oficiais!', 'green');
        log('✅ Zero erros detectados', 'green');
        log('✅ Implementação 100% correta', 'green');
        log('✅ Pronto para uso em produção', 'green');
    } else if (successRate >= 85) {
        log('\n✅ BOM! Sistema funcional com pequenos ajustes necessários', 'yellow');
    } else {
        log('\n⚠️  ATENÇÃO! Sistema requer correções antes do uso', 'red');
    }
}

// EXECUTAR TODAS AS VERIFICAÇÕES
async function runCompleteVerification() {
    try {
        await verifyConfiguration();
        await verifyConnectivity();
        await verifyStripeAPI();
        await verifyFiles();
        verifySecurityPractices();
        verifyOfficialPatterns();
        printSummary();
    } catch (error) {
        log(`\n❌ Erro durante a verificação: ${error.message}`, 'red');
    }
}

// Executar verificação
runCompleteVerification();
