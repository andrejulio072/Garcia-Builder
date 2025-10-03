/**
 * 🚀 GARCIA BUILDER - BACKEND STRIPE PREMIUM
 * Implementação seguindo as melhores práticas oficiais da Stripe
 * Documentação: https://docs.stripe.com/payments/checkout
 * Segurança: Nível enterprise com validação completa
 * Versão: 2.0 Premium
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Configuração de ambiente segura
require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
    silent: false
});

const app = express();

// 🔒 SEGURANÇA - Configurações de nível enterprise
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://js.stripe.com"],
            connectSrc: ["'self'", "https://api.stripe.com"],
            frameSrc: ["https://checkout.stripe.com", "https://js.stripe.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Rate limiting - proteção contra ataques
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // limite de 100 requests por IP
    message: {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// CORS configurado para produção (dinâmico via env)
const defaultCorsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://garciabuilder.fitness',
    'https://www.garciabuilder.fitness',
    'https://garciabuilder.uk',
    'https://www.garciabuilder.uk'
];
const envCors = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const allowedCorsOrigins = envCors.length ? envCors : defaultCorsOrigins;

app.use(cors({
    origin: function(origin, callback) {
        // Permitir chamadas sem origin (ex: curl, mobile app) e checar lista quando houver origin
        if (!origin) return callback(null, true);
        if (allowedCorsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware para parsing JSON com limite de tamanho
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..'), {
    dotfiles: 'deny',
    index: ['index.html'],
    maxAge: '1h'
}));

// 🔑 INICIALIZAÇÃO STRIPE - Validação robusta
let stripe;
let isStripeReady = false;

function initializeStripe() {
    try {
        // Validação das chaves de ambiente
        const secretKey = process.env.STRIPE_SECRET_KEY;
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY; // opcional no servidor

        if (!secretKey) {
            console.warn('⚠️ STRIPE_SECRET_KEY não configurada. O servidor iniciará sem Stripe (modo "not ready").');
            isStripeReady = false;
            return false;
        }

        // Validação do formato das chaves
        if (!secretKey.startsWith('sk_')) {
            throw new Error('❌ STRIPE_SECRET_KEY inválida - deve começar com sk_');
        }

        if (publishableKey && !publishableKey.startsWith('pk_')) {
            console.warn('⚠️ STRIPE_PUBLISHABLE_KEY inválida - deve começar com pk_. Ignorando no servidor.');
        }

        // Verificar se estamos em modo live ou test
        const isLiveMode = secretKey.includes('live');
        const isTestMode = secretKey.includes('test');

        if (!isLiveMode && !isTestMode) {
            throw new Error('❌ Chave Stripe em formato inválido');
        }

        // Inicializar Stripe
        stripe = require('stripe')(secretKey, {
            apiVersion: '2023-10-16', // Versão mais recente
            timeout: 20000, // 20 segundos timeout
            maxNetworkRetries: 3
        });

        isStripeReady = true;

        console.log('🚀 GARCIA BUILDER - STRIPE INICIALIZADO');
        console.log('=' .repeat(50));
        console.log(`✅ Modo: ${isLiveMode ? '🔴 LIVE (Produção)' : '🟡 TEST (Desenvolvimento)'}`);
        console.log(`✅ API Version: 2023-10-16`);
        console.log(`✅ Timeout: 20s`);
        console.log(`✅ Retry: 3x`);
        console.log(`✅ Chave: ${secretKey.substring(0, 12)}...`);
        console.log('=' .repeat(50));

        return true;
    } catch (error) {
        console.error('❌ ERRO NA INICIALIZAÇÃO DO STRIPE:', error.message);
        isStripeReady = false;
        return false;
    }
}

// 📋 CONFIGURAÇÃO DE PLANOS - Preços dinâmicos
const SUBSCRIPTION_PLANS = {
    starter: {
        name: 'Starter Plan',
        description: 'Perfect for beginners starting their fitness journey',
        amount: 7500, // £75.00
        currency: 'gbp',
        interval: 'month',
        features: ['Basic workout plans', 'Nutrition guidelines', 'Email support']
    },
    beginner: {
        name: 'Beginner Plan',
        description: 'Enhanced plan with more features and support',
        amount: 9500, // £95.00
        currency: 'gbp',
        interval: 'month',
        features: ['Enhanced workout plans', 'Meal prep guides', 'Priority support', 'Progress tracking']
    },
    essentials: {
        name: 'Essentials Plan',
        description: 'Comprehensive fitness and nutrition coaching',
        amount: 11500, // £115.00
        currency: 'gbp',
        interval: 'month',
        features: ['Custom workout plans', 'Personalized nutrition', '1-on-1 coaching calls', 'Progress analytics']
    },
    full: {
        name: 'Full Plan',
        description: 'Complete transformation package with premium support',
        amount: 15500, // £155.00
        currency: 'gbp',
        interval: 'month',
        features: ['Premium coaching', 'Weekly check-ins', '24/7 support', 'Supplement guidance', 'Lifestyle coaching']
    },
    premium: {
        name: 'Premium Plan',
        description: 'Ultimate coaching experience with exclusive access',
        amount: 23000, // £230.00
        currency: 'gbp',
        interval: 'month',
        features: ['VIP coaching', 'Daily support', 'Custom meal delivery', 'Exclusive content', 'Personal trainer access']
    }
};

// 🛡️ MIDDLEWARE DE VALIDAÇÃO
function validateStripeReady(req, res, next) {
    if (!isStripeReady) {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'Stripe service is not ready. Please try again later.',
            code: 'STRIPE_NOT_READY'
        });
    }
    next();
}

function validateRequestData(req, res, next) {
    const { planKey, customerEmail } = req.body;

    // Validações obrigatórias
    if (!planKey || !customerEmail) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'planKey and customerEmail are required',
            code: 'MISSING_REQUIRED_FIELDS'
        });
    }

    // Validar plano
    if (!SUBSCRIPTION_PLANS[planKey]) {
        return res.status(400).json({
            error: 'Invalid Plan',
            message: `Plan '${planKey}' not found`,
            code: 'INVALID_PLAN',
            availablePlans: Object.keys(SUBSCRIPTION_PLANS)
        });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({
            error: 'Invalid Email',
            message: 'Please provide a valid email address',
            code: 'INVALID_EMAIL'
        });
    }

    next();
}

// Flag para exigir consentimento de Termos no Checkout (requer ToS URL no Stripe Settings)
const REQUIRE_TOS_CONSENT = (process.env.STRIPE_REQUIRE_TOS_CONSENT || 'false').toLowerCase() === 'true';

// 📊 HEALTH CHECK ENDPOINT
app.get('/health', (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Garcia Builder Stripe API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        stripe: {
            ready: isStripeReady,
            mode: process.env.STRIPE_SECRET_KEY?.includes('live') ? 'live' : 'test'
        },
        features: {
            requireTosConsent: REQUIRE_TOS_CONSENT
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };

    // Sempre retornar 200 para manter o serviço saudável no Render; refletir readiness em payload
    res.status(200).json(healthStatus);
});

// 💳 ENDPOINT PRINCIPAL - Criar Checkout Session
app.post('/api/create-checkout-session', validateStripeReady, validateRequestData, async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            planKey,
            customerEmail,
            customerName,
            successUrl = `${req.protocol}://${req.get('host')}/success.html`,
            cancelUrl = `${req.protocol}://${req.get('host')}/pricing.html`
        } = req.body;

        const plan = SUBSCRIPTION_PLANS[planKey];

        console.log('💳 CRIANDO CHECKOUT SESSION');
        console.log('-'.repeat(40));
        console.log(`📋 Plano: ${plan.name} - £${plan.amount / 100}`);
        console.log(`👤 Cliente: ${customerEmail}`);
        console.log(`🌐 Success URL: ${successUrl}`);
        console.log(`🌐 Cancel URL: ${cancelUrl}`);

        // Criar Customer primeiro (melhor prática)
        let customer;
        try {
            const existingCustomers = await stripe.customers.list({
                email: customerEmail,
                limit: 1
            });

            if (existingCustomers.data.length > 0) {
                customer = existingCustomers.data[0];
                console.log(`✅ Cliente existente encontrado: ${customer.id}`);
            } else {
                customer = await stripe.customers.create({
                    email: customerEmail,
                    name: customerName || customerEmail.split('@')[0],
                    metadata: {
                        source: 'garcia-builder-website',
                        plan: planKey,
                        created_at: new Date().toISOString()
                    }
                });
                console.log(`✅ Novo cliente criado: ${customer.id}`);
            }
        } catch (customerError) {
            console.warn('⚠️ Erro ao criar/buscar customer, continuando sem:', customerError.message);
            customer = null;
        }

        // Configuração da sessão seguindo padrões oficiais
        const sessionConfig = {
            customer: customer?.id,
            customer_email: !customer ? customerEmail : undefined,
            line_items: [{
                price_data: {
                    currency: plan.currency,
                    product_data: {
                        name: plan.name,
                        description: plan.description,
                        metadata: {
                            plan_key: planKey,
                            service: 'garcia-builder-coaching'
                        }
                    },
                    unit_amount: plan.amount,
                    recurring: {
                        interval: plan.interval,
                        interval_count: 1
                    }
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl,
            automatic_tax: { enabled: true },
            billing_address_collection: 'required',
            customer_update: customer ? {
                address: 'auto',
                name: 'auto'
            } : undefined,
            metadata: {
                plan_key: planKey,
                customer_email: customerEmail,
                service: 'garcia-builder',
                created_at: new Date().toISOString()
            },
            subscription_data: {
                metadata: {
                    plan_key: planKey,
                    customer_email: customerEmail,
                    service: 'garcia-builder'
                }
            },
            // Configurações de experiência
            locale: 'en',
            allow_promotion_codes: true,
            // Coleta de consentimento dos Termos (exige ToS URL no Stripe Dashboard → Settings → Public details)
            // Habilite via env STRIPE_REQUIRE_TOS_CONSENT=true após configurar os links no Stripe.
        };

        if (REQUIRE_TOS_CONSENT) {
            sessionConfig.consent_collection = {
                terms_of_service: 'required'
            };
        }

        // Criar a sessão
        const session = await stripe.checkout.sessions.create(sessionConfig);

        const responseTime = Date.now() - startTime;

        console.log(`✅ Sessão criada com sucesso: ${session.id}`);
        console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);
        console.log(`🔗 URL: ${session.url.substring(0, 50)}...`);
        console.log('-'.repeat(40));

        // Resposta otimizada
        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
            plan: {
                key: planKey,
                name: plan.name,
                amount: plan.amount,
                currency: plan.currency,
                features: plan.features
            },
            customer: {
                id: customer?.id,
                email: customerEmail
            },
            metadata: {
                responseTime: `${responseTime}ms`,
                timestamp: new Date().toISOString(),
                version: '2.0'
            }
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        console.error('❌ ERRO AO CRIAR CHECKOUT SESSION:');
        console.error('Tipo:', error.type);
        console.error('Código:', error.code);
        console.error('Mensagem:', error.message);
        console.error('Tempo até erro:', `${responseTime}ms`);

        // Resposta de erro estruturada
        const statusCode = error.statusCode || 500;
        const errorResponse = {
            success: false,
            error: {
                type: error.type || 'unknown_error',
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'An unexpected error occurred',
                param: error.param,
                statusCode: statusCode
            },
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`
        };

        // Log para diferentes tipos de erro
        if (error.type === 'StripeCardError') {
            console.error('🚫 Card Error - problema com o cartão');
        } else if (error.type === 'StripeRateLimitError') {
            console.error('⏰ Rate Limit - muitas requests');
        } else if (error.type === 'StripeInvalidRequestError') {
            console.error('❌ Invalid Request - dados inválidos');
        } else if (error.type === 'StripeAPIError') {
            console.error('🔥 API Error - problema no Stripe');
        } else if (error.type === 'StripeConnectionError') {
            console.error('🌐 Connection Error - problema de rede');
        } else if (error.type === 'StripeAuthenticationError') {
            console.error('🔑 Authentication Error - problema com as chaves');
        }

        res.status(statusCode).json(errorResponse);
    }
});

// 📋 ENDPOINT PARA LISTAR PLANOS
app.get('/api/plans', (req, res) => {
    const plans = Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
        key,
        name: plan.name,
        description: plan.description,
        price: {
            amount: plan.amount,
            currency: plan.currency,
            formatted: `£${(plan.amount / 100).toFixed(2)}`,
            interval: plan.interval
        },
        features: plan.features
    }));

    res.json({
        success: true,
        plans,
        total: plans.length,
        currency: 'GBP',
        timestamp: new Date().toISOString()
    });
});

// 🔍 ENDPOINT PARA VERIFICAR STATUS DA SESSÃO
app.get('/api/session/:sessionId', validateStripeReady, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            success: true,
            session: {
                id: session.id,
                status: session.status,
                payment_status: session.payment_status,
                customer_email: session.customer_details?.email,
                amount_total: session.amount_total,
                currency: session.currency
            }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: {
                message: 'Session not found',
                code: 'SESSION_NOT_FOUND'
            }
        });
    }
});

// � STRIPE WEBHOOK (validação de assinatura)
// Importante: usamos req.rawBody (definido no express.json verify) para validar a assinatura
app.post('/api/stripe-webhook', async (req, res) => {
    if (!isStripeReady) {
        return res.status(503).json({ error: 'Stripe not ready' });
    }

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        console.error('⚠️ STRIPE_WEBHOOK_SECRET não configurado');
        return res.status(500).json({ error: 'Webhook not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;
    try {
        const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
        event = stripe.webhooks.constructEvent(raw, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Trate os eventos principais para assinaturas
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log('✅ checkout.session.completed:', {
                    id: session.id,
                    customer_email: session.customer_details?.email,
                    subscription: session.subscription,
                    payment_status: session.payment_status
                });
                break;
            }
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                console.log(`📦 ${event.type}:`, {
                    id: sub.id,
                    status: sub.status,
                    current_period_end: sub.current_period_end
                });
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object;
                console.log('💸 invoice.paid:', { id: invoice.id, total: invoice.total });
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                console.log('⚠️ invoice.payment_failed:', { id: invoice.id, total: invoice.total });
                break;
            }
            default:
                console.log(`ℹ️ Unhandled event type: ${event.type}`);
        }

        // Responda 200 rapidamente para evitar reenvios
        res.json({ received: true });
    } catch (handlerErr) {
        console.error('💥 Erro ao processar webhook:', handlerErr);
        res.status(500).json({ error: 'Webhook handler error' });
    }
});

// �🚫 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: [
            'GET /health',
            'GET /api/plans',
            'POST /api/create-checkout-session',
            'GET /api/session/:sessionId'
        ]
    });
});

// 💥 Error Handler Global
app.use((error, req, res, next) => {
    console.error('💥 ERRO GLOBAL:', error);

    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
    });
});

// 🚀 INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Inicializar Stripe
        const stripeInitialized = initializeStripe();
        if (!stripeInitialized) {
            console.warn('⚠️ Stripe não inicializado. Continuando com o servidor para servir site e API públicas.');
        }

        // Testar conexão com Stripe
        try {
            if (stripeInitialized) {
                console.log('🔄 Testando conexão com Stripe...');
                await stripe.accounts.retrieve();
                console.log('✅ Conexão com Stripe verificada!');
            }
        } catch (connErr) {
            console.warn('⚠️ Não foi possível verificar conexão com Stripe agora:', connErr.message);
            isStripeReady = false;
        }

        // Iniciar servidor
        const server = app.listen(PORT, () => {
            console.log('🚀 SERVIDOR GARCIA BUILDER INICIADO');
            console.log('='.repeat(50));
            console.log(`✅ Porta: ${PORT}`);
            console.log(`✅ Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✅ URL Local: http://localhost:${PORT}`);
            console.log(`✅ Health Check: http://localhost:${PORT}/health`);
            console.log(`✅ API Docs: http://localhost:${PORT}/api/plans`);
            console.log('='.repeat(50));
            console.log('🎯 Sistema pronto para receber pagamentos!');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🔄 Recebido SIGTERM, fechando servidor...');
            server.close(() => {
                console.log('✅ Servidor fechado com sucesso');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('💥 ERRO AO INICIAR SERVIDOR:', error.message);
        process.exit(1);
    }
}

// Executar apenas se não estiver sendo importado
if (require.main === module) {
    startServer();
}

module.exports = app;
