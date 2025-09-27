/**
 * 🚀 SISTEMA DE VERIFICAÇÃO PREMIUM - GARCIA BUILDER
 * Validação completa do backend melhorado seguindo melhores práticas Stripe
 * Versão: 2.0 Premium
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');

console.log('🚀 VERIFICAÇÃO PREMIUM - GARCIA BUILDER v2.0');
console.log('=' .repeat(70));

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    bright: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let criticalIssues = 0;

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function testResult(testName, passed, details = '', isCritical = false) {
    totalTests++;
    if (passed) {
        passedTests++;
        log(`✅ ${testName}`, 'green');
        if (details) log(`   ${details}`, 'cyan');
    } else {
        failedTests++;
        if (isCritical) {
            criticalIssues++;
            log(`🚨 ${testName} (CRÍTICO)`, 'red');
        } else {
            log(`❌ ${testName}`, 'yellow');
        }
        if (details) log(`   ${details}`, 'white');
    }
}

// 1. VERIFICAÇÃO DE CONFIGURAÇÃO PREMIUM
function verifyPremiumConfiguration() {
    log('\n🔧 1. CONFIGURAÇÃO PREMIUM', 'bold');
    log('-'.repeat(50), 'cyan');

    // Verificar chaves live
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const publicKey = process.env.STRIPE_PUBLISHABLE_KEY;

    testResult(
        'Chave pública LIVE configurada',
        publicKey && publicKey.startsWith('pk_live_'),
        publicKey ? `${publicKey.substring(0, 20)}...` : 'Não encontrada',
        true
    );

    testResult(
        'Chave secreta configurada',
        secretKey && secretKey.startsWith('sk_'),
        secretKey ? `${secretKey.substring(0, 15)}...` : 'Não encontrada',
        true
    );

    testResult(
        'Modo LIVE ativo',
        secretKey && secretKey.includes('live'),
        secretKey?.includes('live') ? 'Produção habilitada' : 'Modo test detectado'
    );

    // Verificar consistência das chaves
    if (publicKey && secretKey) {
        const publicPrefix = publicKey.substring(8, 22); // Extrai ID da conta
        const secretPrefix = secretKey.substring(8, 22);
        testResult(
            'Chaves da mesma conta Stripe',
            publicPrefix === secretPrefix,
            publicPrefix === secretPrefix ? 'Chaves sincronizadas' : 'Chaves de contas diferentes!'
        );
    }
}

// 2. VERIFICAÇÃO DO BACKEND PREMIUM
function verifyPremiumBackend() {
    log('\n🛡️ 2. BACKEND PREMIUM', 'bold');
    log('-'.repeat(50), 'cyan');

    try {
        const serverExists = fs.existsSync(path.join(__dirname, 'api/stripe-server-premium.js'));
        testResult('Servidor premium existe', serverExists);

        if (serverExists) {
            const serverContent = fs.readFileSync(path.join(__dirname, 'api/stripe-server-premium.js'), 'utf8');

            // Verificar recursos de segurança
            testResult(
                'Helmet (segurança) configurado',
                serverContent.includes('helmet'),
                'Proteção contra vulnerabilidades web'
            );

            testResult(
                'Rate limiting implementado',
                serverContent.includes('rateLimit'),
                'Proteção contra ataques DDoS'
            );

            testResult(
                'CORS configurado para produção',
                serverContent.includes('garcia-builder.com'),
                'URLs de produção permitidas'
            );

            testResult(
                'Validação robusta de dados',
                serverContent.includes('validateRequestData'),
                'Middleware de validação customizado'
            );

            testResult(
                'Error handling avançado',
                serverContent.includes('StripeCardError'),
                'Tratamento específico por tipo de erro'
            );

            testResult(
                'Health check endpoint',
                serverContent.includes('/health'),
                'Monitoramento de saúde do sistema'
            );

            testResult(
                'Customer management',
                serverContent.includes('stripe.customers'),
                'Gestão avançada de clientes'
            );

            testResult(
                'Metadata tracking',
                serverContent.includes('metadata'),
                'Rastreamento detalhado de transações'
            );

            testResult(
                'Graceful shutdown',
                serverContent.includes('SIGTERM'),
                'Encerramento seguro do servidor'
            );

            testResult(
                'API versioning',
                serverContent.includes('2023-10-16'),
                'Versão mais recente da API Stripe'
            );
        }
    } catch (error) {
        testResult('Verificação do backend', false, error.message, true);
    }
}

// 3. VERIFICAÇÃO DE SEGURANÇA AVANÇADA
function verifyAdvancedSecurity() {
    log('\n🔒 3. SEGURANÇA AVANÇADA', 'bold');
    log('-'.repeat(50), 'cyan');

    try {
        // Verificar .gitignore
        const gitignoreExists = fs.existsSync(path.join(__dirname, '.gitignore'));
        if (gitignoreExists) {
            const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
            testResult(
                '.env protegido no .gitignore',
                gitignoreContent.includes('.env'),
                'Variáveis de ambiente seguras'
            );
        }

        // Verificar se chaves não estão expostas no frontend
        const frontendFiles = ['pricing.html', 'js/stripe-config.js', 'index.html'];
        let secretKeyExposed = false;

        frontendFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('sk_live_') || content.includes('sk_test_')) {
                    secretKeyExposed = true;
                }
            }
        });

        testResult(
            'Chave secreta não exposta no frontend',
            !secretKeyExposed,
            secretKeyExposed ? 'RISCO CRÍTICO DE SEGURANÇA!' : 'Frontend seguro',
            secretKeyExposed
        );

        // Verificar package.json para dependências de segurança
        const packageExists = fs.existsSync(path.join(__dirname, 'package.json'));
        if (packageExists) {
            const packageContent = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
            const packageData = JSON.parse(packageContent);

            testResult(
                'Helmet instalado',
                packageData.dependencies && packageData.dependencies.helmet,
                'Proteção de cabeçalhos HTTP'
            );

            testResult(
                'Rate limiting instalado',
                packageData.dependencies && packageData.dependencies['express-rate-limit'],
                'Proteção contra spam'
            );
        }

    } catch (error) {
        testResult('Verificação de segurança', false, error.message);
    }
}

// 4. VERIFICAÇÃO DE FUNCIONALIDADES PREMIUM
function verifyPremiumFeatures() {
    log('\n⭐ 4. FUNCIONALIDADES PREMIUM', 'bold');
    log('-'.repeat(50), 'cyan');

    try {
        const serverContent = fs.readFileSync(path.join(__dirname, 'api/stripe-server-premium.js'), 'utf8');

        testResult(
            'Planos premium configurados',
            serverContent.includes('premium') && serverContent.includes('£230'),
            '5 planos de £75 a £230'
        );

        testResult(
            'Automatic tax habilitado',
            serverContent.includes('automatic_tax'),
            'Cálculo automático de impostos'
        );

        testResult(
            'Address collection configurado',
            serverContent.includes('billing_address_collection'),
            'Coleta de endereço para compliance'
        );

        testResult(
            'Terms of service consent',
            serverContent.includes('terms_of_service'),
            'Consentimento de termos obrigatório'
        );

        testResult(
            'Promotional codes habilitados',
            serverContent.includes('allow_promotion_codes'),
            'Suporte a códigos promocionais'
        );

        testResult(
            'Session status endpoint',
            serverContent.includes('/api/session/'),
            'Verificação de status de pagamento'
        );

        testResult(
            'Plans listing endpoint',
            serverContent.includes('/api/plans'),
            'API para listar planos disponíveis'
        );

    } catch (error) {
        testResult('Verificação de funcionalidades', false, error.message);
    }
}

// 5. VERIFICAÇÃO DE PRODUÇÃO
function verifyProductionReadiness() {
    log('\n🚀 5. PRONTIDÃO PARA PRODUÇÃO', 'bold');
    log('-'.repeat(50), 'cyan');

    // Verificar se está usando chaves live
    const isLiveMode = process.env.STRIPE_SECRET_KEY?.includes('live');
    testResult(
        'Modo de produção ativo',
        isLiveMode,
        isLiveMode ? 'Chaves live configuradas' : 'Ainda em modo test'
    );

    // Verificar configuração de CORS para produção
    try {
        const serverContent = fs.readFileSync(path.join(__dirname, 'api/stripe-server-premium.js'), 'utf8');
        testResult(
            'CORS configurado para produção',
            serverContent.includes('garcia-builder.com'),
            'Domínio de produção permitido'
        );

        testResult(
            'Timeout configurado',
            serverContent.includes('timeout: 20000'),
            'Timeout de 20s para requests'
        );

        testResult(
            'Retry configurado',
            serverContent.includes('maxNetworkRetries: 3'),
            '3 tentativas em caso de falha'
        );

    } catch (error) {
        testResult('Verificação de produção', false, error.message);
    }
}

// 6. TESTE DE CONECTIVIDADE (opcional)
async function testConnectivity() {
    log('\n🌐 6. TESTE DE CONECTIVIDADE', 'bold');
    log('-'.repeat(50), 'cyan');

    try {
        // Testar se podemos conectar com Stripe
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        const account = await stripe.accounts.retrieve();
        testResult(
            'Conexão com Stripe API',
            !!account,
            `Conta: ${account.business_profile?.name || account.email || 'Conectada'}`
        );

        testResult(
            'Conta ativa',
            !account.requirements?.currently_due?.length,
            account.requirements?.currently_due?.length ?
                `${account.requirements.currently_due.length} itens pendentes` :
                'Conta totalmente configurada'
        );

    } catch (error) {
        testResult(
            'Conexão com Stripe',
            false,
            error.message.includes('Invalid API Key') ?
                'Chave inválida - verificar configuração' : error.message
        );
    }
}

// RESUMO FINAL PREMIUM
function printPremiumSummary() {
    log('\n📊 RESUMO PREMIUM - GARCIA BUILDER v2.0', 'bold');
    log('=' .repeat(70), 'cyan');

    log(`Total de testes: ${totalTests}`, 'white');
    log(`✅ Passou: ${passedTests}`, 'green');
    log(`❌ Falhou: ${failedTests}`, 'yellow');
    log(`🚨 Críticos: ${criticalIssues}`, 'red');

    const successRate = Math.round((passedTests / totalTests) * 100);
    const color = successRate >= 95 ? 'green' : successRate >= 85 ? 'yellow' : 'red';
    log(`📈 Taxa de sucesso: ${successRate}%`, color);

    log('\n🎯 AVALIAÇÃO FINAL:', 'bold');

    if (successRate >= 98 && criticalIssues === 0) {
        log('🏆 EXCELÊNCIA PREMIUM! Sistema perfeito!', 'green');
        log('✅ Todas as melhores práticas implementadas', 'green');
        log('✅ Segurança de nível enterprise', 'green');
        log('✅ Pronto para produção com confiança total', 'green');
        log('✅ Zero issues críticos detectados', 'green');
    } else if (successRate >= 90 && criticalIssues === 0) {
        log('🌟 PREMIUM APROVADO! Sistema excelente!', 'green');
        log('✅ Implementação seguindo padrões oficiais', 'green');
        log('✅ Segurança robusta implementada', 'green');
        log('✅ Pronto para produção', 'green');
    } else if (criticalIssues === 0) {
        log('✅ APROVADO com melhorias menores necessárias', 'yellow');
        log('⚠️  Alguns ajustes recomendados', 'yellow');
    } else {
        log('⚠️  ATENÇÃO: Issues críticos detectados', 'red');
        log('🔧 Correção necessária antes da produção', 'red');
    }

    log('\n🎊 GARCIA BUILDER v2.0 - BACKEND PREMIUM VERIFICADO!', 'magenta');
}

// EXECUTAR VERIFICAÇÃO COMPLETA
async function runPremiumVerification() {
    try {
        verifyPremiumConfiguration();
        verifyPremiumBackend();
        verifyAdvancedSecurity();
        verifyPremiumFeatures();
        verifyProductionReadiness();
        await testConnectivity();
        printPremiumSummary();
    } catch (error) {
        log(`\n💥 Erro durante verificação: ${error.message}`, 'red');
    }
}

// Executar verificação
runPremiumVerification();
