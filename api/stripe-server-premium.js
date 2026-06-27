/**
 * 🚀 GARCIA BUILDER - BACKEND STRIPE PREMIUM
 * Implementação seguindo as melhores práticas oficiais da Stripe
 * Documentação: https://docs.stripe.com/payments/checkout
 * Segurança: Nível enterprise com validação completa
 * Versão: 2.0 Premium
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Configuração de ambiente segura
require('dotenv').config({
    path: path.join(__dirname, '..', '.env'),
    silent: false
});

const app = express();

// In-memory attribution enrichment store (fbp/fbc) – ephemeral (cleared on restart)
const metaAttributionStore = new Map();

// 🔒 SEGURANÇA - Configurações de nível enterprise
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            // Allow inline styles for Bootstrap and our pages, plus Google Fonts
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://fonts.googleapis.com",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            fontSrc: [
                "'self'", 
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            // Allow inline scripts (many pages use small inline helpers), and common CDNs we use
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Required for some dynamic functionality
                "https://js.stripe.com",
                "https://www.googletagmanager.com",
                "https://www.google-analytics.com",
                "https://connect.facebook.net",
                "https://cdn.jsdelivr.net",
                "https://cdnjs.cloudflare.com"
            ],
            // Allow API calls to Stripe, Supabase and Analytics
            connectSrc: [
                "'self'",
                "https://api.stripe.com",
                "https://*.supabase.co",
                "https://www.google-analytics.com",
                "https://analytics.google.com",
                "https://stats.g.doubleclick.net"
            ],
            // Allow external images (testimonials avatars etc.) and data URLs
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:", // Allow HTTP images for development/external sources
                "https://www.facebook.com",
                "https://images.pexels.com"
            ],
            // Checkout + Stripe frames, and GTM if needed
            frameSrc: [
                "https://checkout.stripe.com",
                "https://js.stripe.com",
                "https://www.googletagmanager.com",
                "https://www.youtube.com",
                "https://www.youtube-nocookie.com"
            ],
            // Allow object/embed for potential future use
            objectSrc: ["'none'"],
            // Base URI restriction
            baseUri: ["'self'"],
            // Form action restriction
            formAction: ["'self'", "https://checkout.stripe.com"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
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

// URL rewrite helpers for common path issues in production (case sensitivity, spaces)
app.use((req, res, next) => {
    try {
        // Normalize "logo files" (lowercase) to "Logo Files" (actual folder)
        const decoded = decodeURIComponent(req.url);
        if (decoded.toLowerCase().startsWith('/logo files/')) {
            req.url = decoded.replace(/\/logo files\//i, '/Logo Files/');
        }
    } catch (e) {
        // continue without rewrite on decode errors
    }
    next();
});

const publicPageAliases = {
    '/lead-magnet.html': 'lead-magnet.html',
    '/thanks-ebook.html': 'thanks-ebook.html',
    '/first-workout.html': 'first-workout.html'
};

app.get(Object.keys(publicPageAliases), (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'pages', 'public', publicPageAliases[req.path]));
});

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
    monthly: {
        name: 'Monthly Online Coaching',
        description: 'Standard online coaching with training, nutrition guidance, weekly check-ins, app access, support and accountability.',
        amount: 15000, // €150.00
        currency: 'eur',
        mode: 'subscription',
        interval: 'month',
        features: ['Personalized training plan', 'Nutrition guidance', 'Weekly check-ins', 'Trainerize app access', 'Direct support and accountability']
    },
    eight_week: {
        name: '8 Week Fat Loss Kickstart',
        description: 'A focused 8-week reset with training, nutrition, shopping list, support and realistic fat-loss targets.',
        amount: 35000, // €350.00
        currency: 'eur',
        mode: 'payment',
        features: ['8-week training block', 'Nutrition targets and shopping list', 'Weekly check-ins', 'Trainerize app access', 'Expected fat loss: 5-8kg when followed consistently']
    },
    twelve_week: {
        name: '12 Week Transformation',
        description: 'The flagship 12-week transformation plan for visible fat loss, strength progress and stronger routines.',
        amount: 60000, // €600.00
        currency: 'eur',
        mode: 'payment',
        features: ['12-week progressive training plan', 'Nutrition plan with adjustments', 'Shopping list and meal structure guidance', 'Weekly accountability', 'Expected fat loss: 9-12kg when followed consistently']
    },
    eighteen_week: {
        name: '18 Week Complete Transformation',
        description: 'The most complete transformation program, built for deeper results and long-term habit building.',
        amount: 75000, // €750.00
        currency: 'eur',
        mode: 'payment',
        features: ['18-week periodized coaching block', 'Nutrition strategy and shopping list', 'Long-term habit system', 'Priority support', 'Expected fat loss: 12-15kg when followed consistently']
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

function getOptionalSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return null;
    return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function createOptionalMailTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

async function sendAdminEmail({ subject, html, replyTo }) {
    const transport = createOptionalMailTransport();
    if (!transport) return { skipped: true };
    const from = process.env.FROM_EMAIL || 'no-reply@garciabuilder.fitness';
    const to = process.env.ADMIN_EMAIL || 'andre@garciabuilder.fitness';
    await transport.sendMail({ from, to, subject, html, replyTo: replyTo || undefined });
    return { ok: true };
}

async function sendEmail({ to, subject, html, replyTo, attachments }) {
    const transport = createOptionalMailTransport();
    if (!transport) return { skipped: true };
    const from = process.env.FROM_EMAIL || 'Garcia Builder <no-reply@garciabuilder.fitness>';
    await transport.sendMail({ from, to, subject, html, replyTo: replyTo || undefined, attachments });
    return { ok: true };
}

function getPublicBaseUrl(req) {
    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'https').toString().split(',')[0].trim();
    const host = (req.headers['x-forwarded-host'] || req.get('host') || 'garciabuilder.fitness').toString().split(',')[0].trim();
    if (/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host)) {
        return `${proto}://${host}`.replace(/\/$/, '');
    }
    const envBase = process.env.PUBLIC_SITE_URL || process.env.FRONTEND_URL;
    if (envBase) return envBase.replace(/\/$/, '');
    return `${proto}://${host}`.replace(/\/$/, '');
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

app.post('/api/contact', async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            preferred_contact,
            primary_goal,
            timeline,
            experience,
            budget,
            message,
            page_path,
            user_agent,
        } = req.body || {};

        if (!email || !message) {
            return res.status(400).json({ error: 'Email and message are required' });
        }

        let saved = false;
        const supa = getOptionalSupabaseClient();
        if (supa) {
            const { error } = await supa.from('contact_inquiries').insert([{
                name: name || null,
                email,
                phone: phone || null,
                preferred_contact: preferred_contact || null,
                primary_goal: primary_goal || null,
                timeline: timeline || null,
                experience: experience || null,
                budget: budget || null,
                message,
                page_path: page_path || req.headers.referer || '',
                user_agent: user_agent || req.headers['user-agent'] || '',
            }]);
            if (error) {
                console.warn('contact Supabase insert skipped/failed:', error.message);
            } else {
                saved = true;
            }
        }

        const emailResult = await sendAdminEmail({
            subject: `New coaching enquiry: ${name || email}`,
            replyTo: email,
            html: `
                <div style="font-family:Inter,Arial,sans-serif;color:#0b1220">
                    <h2>New Garcia Builder contact enquiry</h2>
                    <p><strong>Name:</strong> ${escapeHtml(name || '')}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(phone || '')}</p>
                    <p><strong>Preferred contact:</strong> ${escapeHtml(preferred_contact || '')}</p>
                    <p><strong>Goal:</strong> ${escapeHtml(primary_goal || '')}</p>
                    <p><strong>Timeline:</strong> ${escapeHtml(timeline || '')}</p>
                    <p><strong>Experience:</strong> ${escapeHtml(experience || '')}</p>
                    <p><strong>Budget:</strong> ${escapeHtml(budget || '')}</p>
                    <p><strong>Page:</strong> ${escapeHtml(page_path || req.headers.referer || '')}</p>
                    <hr>
                    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
                </div>`
        });

        return res.status(200).json({ ok: true, saved, emailSent: !!emailResult.ok, emailSkipped: !!emailResult.skipped });
    } catch (error) {
        console.error('contact endpoint error', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/lead', async (req, res) => {
    try {
        const { email, name, source, notes, ...rest } = req.body || {};
        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ error: 'Valid email required' });
        }

        let saved = false;
        const metadata = {
            ...rest,
            page_path: req.headers['x-original-url'] || req.headers.referer || null,
            user_agent: req.headers['user-agent'] || null,
        };
        const cleanNotes = notes || JSON.stringify(metadata);

        const supa = getOptionalSupabaseClient();
        if (supa) {
            const leadName = name || cleanEmail;
            const leadSource = source || req.headers.referer || 'website';
            const insertCandidates = [
              {
                email: cleanEmail,
                name: leadName,
                source: leadSource,
                notes: cleanNotes,
              },
              {
                email: cleanEmail,
                name: leadName,
                source: leadSource,
              },
              {
                email: cleanEmail,
                name: leadName,
              },
            ];

            for (const candidate of insertCandidates) {
                const { error } = await supa.from('leads').insert([candidate]);
                if (!error) {
                    saved = true;
                    break;
                }

                const message = String(error.message || '').toLowerCase();
                const isMissingColumn = error.code === 'PGRST204' || message.includes('schema cache') || message.includes('could not find');
                if (!isMissingColumn) {
                    console.warn('lead Supabase insert skipped/failed:', error.message);
                    break;
                }
            }
        }

        const adminEmailResult = await sendAdminEmail({
            subject: `New free guide lead: ${name || cleanEmail}`,
            replyTo: cleanEmail,
            html: `
                <div style="font-family:Inter,Arial,sans-serif;color:#0b1220">
                    <h2>New 28 Days Fat Loss Quickstart lead</h2>
                    <p><strong>Name:</strong> ${escapeHtml(name || '')}</p>
                    <p><strong>Email:</strong> ${escapeHtml(cleanEmail)}</p>
                    <p><strong>Source:</strong> ${escapeHtml(source || 'website')}</p>
                    <pre style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(cleanNotes)}</pre>
                </div>`
        }).catch(error => {
            console.warn('lead admin email skipped/failed:', error.message);
            return { ok: false, error: error.message };
        });

        const guidePath = path.join(__dirname, '..', 'assets', '28-days-fat-loss-quickstart.pdf');
        const guideUrl = `${getPublicBaseUrl(req)}/assets/28-days-fat-loss-quickstart.pdf`;
        const attachments = fs.existsSync(guidePath)
            ? [{ filename: '28-Days-Fat-Loss-Quickstart-Garcia-Builder.pdf', path: guidePath }]
            : undefined;
        const customerEmailResult = await sendEmail({
            to: cleanEmail,
            subject: 'Your Free 28 Days Fat Loss Quickstart',
            html: `
                <div style="font-family:Inter,Arial,sans-serif;color:#0b1220;line-height:1.55">
                    <h2>Your 28 Days Fat Loss Quickstart is ready</h2>
                    <p>Hi ${escapeHtml(name || 'there')},</p>
                    <p>Here is your free Garcia Builder guide. Use it to set your first 28 days of training, nutrition, steps and accountability.</p>
                    <p>
                        <a href="${guideUrl}" style="display:inline-block;background:#f6c84e;color:#0b1220;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:800">
                            Download the PDF
                        </a>
                    </p>
                    <p>The PDF is also attached to this email when attachments are supported by your inbox.</p>
                    <p>If you want help applying it to your body, schedule a free consultation here:</p>
                    <p><a href="https://calendly.com/andrenjulio072/consultation">Book your free consultation</a></p>
                    <p>Andre Garcia<br>Garcia Builder Coaching</p>
                </div>`,
            attachments
        }).catch(error => {
            console.warn('lead customer email skipped/failed:', error.message);
            return { ok: false, error: error.message };
        });

        return res.status(200).json({
            ok: true,
            saved,
            adminEmailSent: !!adminEmailResult.ok,
            adminEmailSkipped: !!adminEmailResult.skipped,
            customerEmailSent: !!customerEmailResult.ok,
            customerEmailSkipped: !!customerEmailResult.skipped,
            guideUrl,
            attached: !!attachments
        });
    } catch (error) {
        console.error('lead endpoint error', error);
        return res.status(500).json({ error: 'Server error' });
    }
});

// 💳 ENDPOINT PRINCIPAL - Criar Checkout Session
app.post('/api/create-checkout-session', validateStripeReady, validateRequestData, async (req, res) => {
    const startTime = Date.now();

    try {
        const {
            planKey,
            customerEmail,
            customerName,
            trainerizeInvite, // optional Trainerize invite URL
            successUrl = `${req.protocol}://${req.get('host')}/success.html`,
            cancelUrl = `${req.protocol}://${req.get('host')}/pricing.html`,
            utm: rawUtm
        } = req.body;

        // --- UTM / Attribution Sanitization ---
        const allowedUtmKeys = ['source','medium','campaign','term','content'];
        let utmMeta = {};
        if (rawUtm && typeof rawUtm === 'object') {
            for (const k of allowedUtmKeys) {
                if (rawUtm[k]) {
                    const val = String(rawUtm[k]).slice(0,60); // trim length for metadata safety
                    if (val.trim()) utmMeta[`utm_${k}`] = val.trim();
                }
            }
        }
        if (Object.keys(utmMeta).length === 0) {
            utmMeta.utm_source = 'direct'; // basic fallback for later reporting
        }

        const plan = SUBSCRIPTION_PLANS[planKey];

        console.log('💳 CRIANDO CHECKOUT SESSION');
        console.log('-'.repeat(40));
        console.log(`📋 Plano: ${plan.name} - ${plan.currency.toUpperCase()} ${(plan.amount / 100).toFixed(2)}`);
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

        const priceData = {
            currency: plan.currency,
            product_data: {
                name: plan.name,
                description: plan.description,
                metadata: {
                    plan_key: planKey,
                    service: 'garcia-builder-coaching'
                }
            },
            unit_amount: plan.amount
        };

        if (plan.mode === 'subscription') {
            priceData.recurring = {
                interval: plan.interval || 'month',
                interval_count: 1
            };
        }

        // Configuração da sessão seguindo padrões oficiais
        const sessionConfig = {
            customer: customer?.id,
            customer_email: !customer ? customerEmail : undefined,
            line_items: [{
                price_data: priceData,
                quantity: 1
            }],
            mode: plan.mode === 'subscription' ? 'subscription' : 'payment',
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
                plan_name: plan.name,
                customer_email: customerEmail,
                service: 'garcia-builder',
                created_at: new Date().toISOString(),
                client_ip: (req.ip || req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim().slice(0,45),
                client_ua: (req.headers['user-agent'] || '').slice(0,200),
                trainerize_invite: trainerizeInvite || process.env.TRAINERIZE_INVITE_URL || '',
                ...utmMeta
            },
            // Configurações de experiência
            locale: 'en',
            allow_promotion_codes: false,
            // Coleta de consentimento dos Termos (exige ToS URL no Stripe Dashboard → Settings → Public details)
            // Habilite via env STRIPE_REQUIRE_TOS_CONSENT=true após configurar os links no Stripe.
        };

        if (plan.mode === 'subscription') {
            sessionConfig.subscription_data = {
                metadata: {
                    plan_key: planKey,
                    plan_name: plan.name,
                    customer_email: customerEmail,
                    service: 'garcia-builder',
                    client_ip: (req.ip || req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim().slice(0,45),
                    client_ua: (req.headers['user-agent'] || '').slice(0,200),
                    trainerize_invite: trainerizeInvite || process.env.TRAINERIZE_INVITE_URL || '',
                    ...utmMeta
                }
            };
        }

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

// Store Meta attribution identifiers (fbp/fbc) mapped to sessionId for later CAPI enrichment
app.post('/api/attrib', (req, res) => {
    try {
        const { sessionId, fbp, fbc } = req.body || {};
        if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
            return res.status(400).json({ success:false, error: 'INVALID_SESSION_ID' });
        }
        // Basic size limits
        const safeFbp = (fbp && fbp.length < 128) ? fbp : undefined;
        const safeFbc = (fbc && fbc.length < 256) ? fbc : undefined;
        metaAttributionStore.set(sessionId, { fbp: safeFbp, fbc: safeFbc, ts: Date.now() });
        // Auto-expire after 3 hours
        setTimeout(()=> metaAttributionStore.delete(sessionId), 3 * 60 * 60 * 1000).unref?.();
        return res.json({ success:true });
    } catch (e) {
        return res.status(500).json({ success:false, error:'INTERNAL', message:e.message });
    }
});

// Success page expects /api/payment-status/:sessionId (alias of session status with enriched metadata)
app.get('/api/payment-status/:sessionId', validateStripeReady, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });
        const paid = session.payment_status === 'paid';
            res.json({
                status: paid ? 'paid' : session.payment_status,
                session_id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_details?.email,
                subscription_id: session.subscription?.id || session.subscription,
                plan_key: session.metadata?.plan_key,
                plan_name: session.metadata?.plan_name || session.metadata?.plan_key || 'Coaching Plan',
                trainerize_invite: session.metadata?.trainerize_invite || null
            });
    } catch (e) {
        res.status(404).json({ status:'error', error:'NOT_FOUND' });
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
            formatted: `€${(plan.amount / 100).toFixed(2)}`,
            interval: plan.interval || null,
            mode: plan.mode
        },
        features: plan.features
    }));

    res.json({
        success: true,
        plans,
        total: plans.length,
        currency: 'EUR',
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

// STRIPE WEBHOOK (validação de assinatura)
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
                // ===== Server-side Purchase Attribution (GA4 + Meta) =====
                try {
                    const email = session.customer_details?.email || 'unknown@unknown';
                    const currency = (session.currency || 'eur').toUpperCase();
                    const value = (session.amount_total || 0) / 100; // Stripe in minor units
                    const transactionId = session.id;
                    const planKey = session.metadata?.plan_key || session.metadata?.plan || 'unknown_plan';
                    const utm = {
                        source: session.metadata?.utm_source,
                        medium: session.metadata?.utm_medium,
                        campaign: session.metadata?.utm_campaign,
                        term: session.metadata?.utm_term,
                        content: session.metadata?.utm_content
                    };
                    console.log('📎 UTM (session.metadata):', utm);

                    // Look up Meta attribution identifiers if provided by client
                    const metaIds = metaAttributionStore.get(transactionId) || {};
                    if (metaIds.fbp || metaIds.fbc) {
                        console.log('🔍 Found Meta attribution IDs for session:', metaIds);
                    }

                    // GA4 Measurement Protocol
                    if (process.env.GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
                        const gaParams = {
                            transaction_id: transactionId,
                            value,
                            currency,
                            affiliation: 'stripe_webhook',
                            event_id: transactionId, // dedupe potential client/server sends
                            items: [{
                                item_id: planKey,
                                item_name: session.metadata?.plan_name || session.metadata?.plan_key || 'Coaching Plan',
                                price: value,
                                quantity: 1
                            }]
                        };
                        // Attach UTM params if present
                        if (utm.source) gaParams.utm_source = utm.source;
                        if (utm.medium) gaParams.utm_medium = utm.medium;
                        if (utm.campaign) gaParams.utm_campaign = utm.campaign;
                        if (utm.term) gaParams.utm_term = utm.term;
                        if (utm.content) gaParams.utm_content = utm.content;

                        const gaPayload = {
                            client_id: `srv.${transactionId}`,
                            events: [{
                                name: 'purchase',
                                params: gaParams
                            }]
                        };
                        fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(gaPayload)
                        }).then(r => r.text()).then(t => {
                            console.log('📊 GA4 MP purchase sent:', transactionId, t.slice(0,120));
                        }).catch(err => console.warn('GA4 MP error:', err.message));
                    } else {
                        console.log('ℹ️ GA4_MEASUREMENT_ID or GA4_API_SECRET missing - skipping GA4 server event');
                    }

                    // Meta Conversions API (optional)
                    if (process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN) {
                        const metaCustom = { currency, value };
                        const userData = {
                            em: [ require('crypto').createHash('sha256').update(email.trim().toLowerCase()).digest('hex') ]
                        };
                        if (metaIds.fbp) userData.fbp = metaIds.fbp;
                        if (metaIds.fbc) userData.fbc = metaIds.fbc;
                        // Include client IP / UA if captured at checkout creation (from metadata)
                        if (session.metadata?.client_ip) userData.client_ip_address = session.metadata.client_ip;
                        if (session.metadata?.client_ua) userData.client_user_agent = session.metadata.client_ua;
                        const metaEvent = {
                            data: [{
                                event_name: 'Purchase',
                                event_time: Math.floor(Date.now()/1000),
                                action_source: 'website',
                                event_source_url: `https://garciabuilder.fitness/success.html?session_id=${transactionId}`,
                                event_id: transactionId,
                                user_data: userData,
                                custom_data: metaCustom
                            }],
                            // Provide test_event_code when running in test mode (optional env)
                            test_event_code: process.env.META_CAPI_TEST_EVENT_CODE || undefined
                        };
                        fetch(`https://graph.facebook.com/v19.0/${process.env.META_PIXEL_ID}/events?access_token=${process.env.META_CAPI_TOKEN}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(metaEvent)
                        }).then(r=>r.json()).then(j=>{
                            console.log('📈 Meta CAPI purchase sent:', transactionId, JSON.stringify(j).slice(0,500));
                        }).catch(err => console.warn('Meta CAPI error:', err.message));
                    } else {
                        console.log('ℹ️ META_PIXEL_ID or META_CAPI_TOKEN missing - skipping Meta CAPI');
                    }
                } catch (attribErr) {
                    console.warn('⚠️ Attribution dispatch failed:', attribErr.message);
                }
                // Onboarding email (optional; depends on SMTP env)
                try {
                    const { sendOnboardingEmail, sendAdminPurchaseNotification } = require('./onboarding-email');
                    const email = session.customer_details?.email;
                    const planName = session.metadata?.plan_name || session.metadata?.plan_key || 'Coaching Plan';
                    const trainerizeLink = session.metadata?.trainerize_invite || process.env.TRAINERIZE_INVITE_URL;
                    const locale = session.locale === 'pt' || session.customer_details?.address?.country === 'BR' ? 'pt' : 'en';
                    await sendAdminPurchaseNotification({
                        customerEmail: email,
                        customerName: session.customer_details?.name,
                        planName,
                        amount: session.amount_total,
                        currency: session.currency,
                        sessionId: session.id
                    });
                    if (email && trainerizeLink) {
                        await sendOnboardingEmail({ to: email, name: session.customer_details?.name, planName, trainerizeLink, locale });
                        console.log('✉️ Onboarding email queued/sent to', email);
                    } else {
                        console.log('ℹ️ Skipping onboarding email (missing email or trainerize link)');
                    }
                } catch (mailErr) {
                    console.warn('⚠️ Onboarding email failed/skipped:', mailErr.message);
                }
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

// 🚫 404 Handler
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
