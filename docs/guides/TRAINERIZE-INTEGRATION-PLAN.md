# PLANO DE INTEGRAÇÃO TRAINERIZE - GARCIA BUILDER (ARQUIVADO)

> **Decisão de 23 de junho de 2026:** esta integração não faz mais parte do roadmap ativo. O produto deve priorizar uma API própria para o futuro Garcia Builder Fitness App. My PT Hub pode ser avaliado separadamente como solução temporária, sem acoplamento do banco de dados principal.

**Data:** 8 de Outubro de 2025
**Prioridade:** 🔥 ALTA
**Status:** 📋 PLANEJAMENTO

---

## 🎯 OBJETIVO

Integrar o Trainerize com o site Garcia Builder para **automatizar 100% do fluxo de clientes**, desde o pagamento até o acesso ao app, eliminando trabalho manual e melhorando a experiência.

---

## 📊 SITUAÇÃO ATUAL

### ✅ **O que já temos:**
- Menções ao Trainerize em 7 páginas (index, pricing, about, faq, success, blog)
- Link para perfil: `https://www.trainerize.me/profile/garciabuilder/AndreJulio.Garcia`
- Supabase configurado (auth, user_profiles, body_metrics)
- Sistema de pagamento Stripe funcionando
- App chat integrado
- Dashboard de trainer básico
- Sistema de autenticação completo

### ❌ **O que falta:**
- **API do Trainerize** não está integrada
- Processo manual: pagar → Andre adiciona manualmente no Trainerize
- Nenhuma sincronização automática de dados
- Sem webhooks configurados
- Cliente precisa baixar app separadamente (sem onboarding automático)

---

## 🔧 ARQUITETURA DA INTEGRAÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO AUTOMATIZADO                        │
└─────────────────────────────────────────────────────────────┘

1. Cliente paga no Stripe
   ↓
2. Stripe Webhook → Supabase Edge Function
   ↓
3. Supabase cria user_profile
   ↓
4. Edge Function chama Trainerize API
   ↓
5. Trainerize cria conta do cliente
   ↓
6. Envia email com:
   - Link de download do app
   - Credenciais de acesso
   - Instruções de onboarding
   ↓
7. Cliente recebe App chat de boas-vindas
   ↓
8. Dashboard mostra status "Active"
```

---

## 🛠️ ETAPAS DE IMPLEMENTAÇÃO

### **FASE 1: SETUP INICIAL** (1-2 dias)
**Prioridade:** Crítica

#### 1.1 Configurar API do Trainerize
- [ ] Criar conta Business no Trainerize (se necessário upgrade)
- [ ] Obter API Key no painel do Trainerize
- [ ] Estudar documentação: https://trainerize.me/api
- [ ] Testar endpoints principais:
  - `POST /clients` - Criar cliente
  - `GET /clients/{id}` - Buscar cliente
  - `PATCH /clients/{id}` - Atualizar cliente
  - `POST /clients/{id}/workouts` - Adicionar treino

#### 1.2 Armazenar credenciais
```sql
-- Criar tabela para armazenar tokens
CREATE TABLE trainerize_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  base_url TEXT DEFAULT 'https://api.trainerize.com/v1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **FASE 2: WEBHOOK STRIPE → TRAINERIZE** (2-3 dias)
**Prioridade:** Crítica

#### 2.1 Criar Edge Function no Supabase
```typescript
// supabase/functions/stripe-to-trainerize/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  // Verificar assinatura Stripe
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'))
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    Deno.env.get('STRIPE_WEBHOOK_SECRET')
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // 1. Criar usuário no Supabase
    const { data: user } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        email: session.customer_email,
        full_name: session.customer_details.name,
        subscription_status: 'active',
        plan_type: session.metadata.plan_type
      })
      .select()
      .single()

    // 2. Criar cliente no Trainerize
    const trainerizeResponse = await fetch('https://api.trainerize.com/v1/clients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('TRAINERIZE_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: session.customer_details.name.split(' ')[0],
        last_name: session.customer_details.name.split(' ').slice(1).join(' '),
        email: session.customer_email,
        phone: session.customer_details.phone,
        plan_id: getTrainerizePlanId(session.metadata.plan_type)
      })
    })

    const trainerizeClient = await trainerizeResponse.json()

    // 3. Atualizar Supabase com ID do Trainerize
    await supabaseAdmin
      .from('user_profiles')
      .update({ trainerize_id: trainerizeClient.id })
      .eq('id', user.id)

    // 4. Enviar email de boas-vindas
    await sendWelcomeEmail(user, trainerizeClient)

    // 5. Notificar App chat
    await sendApp chatNotification(user)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### 2.2 Configurar Webhook no Stripe
1. Ir para: https://dashboard.stripe.com/webhooks
2. Adicionar endpoint: `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-to-trainerize`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar webhook secret

---

### **FASE 3: SINCRONIZAÇÃO DE DADOS** (2-3 dias)
**Prioridade:** Alta

#### 3.1 Atualizar schema do Supabase
```sql
-- Adicionar coluna trainerize_id
ALTER TABLE user_profiles
ADD COLUMN trainerize_id TEXT UNIQUE;

-- Criar tabela de sincronização
CREATE TABLE trainerize_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  trainerize_id TEXT NOT NULL,
  last_sync TIMESTAMP DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending',
  sync_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_trainerize_sync_user_id ON trainerize_sync(user_id);
CREATE INDEX idx_trainerize_sync_status ON trainerize_sync(sync_status);
```

#### 3.2 Criar Edge Function para sincronização periódica
```typescript
// supabase/functions/sync-trainerize/index.ts

// Roda a cada 1 hora via Supabase Cron
serve(async (req) => {
  // Buscar clientes ativos no Supabase
  const { data: clients } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('subscription_status', 'active')
    .not('trainerize_id', 'is', null)

  for (const client of clients) {
    // Buscar dados atualizados no Trainerize
    const response = await fetch(
      `https://api.trainerize.com/v1/clients/${client.trainerize_id}`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('TRAINERIZE_API_KEY')}`
        }
      }
    )

    const trainerizeData = await response.json()

    // Atualizar Supabase com dados do Trainerize
    await supabaseAdmin
      .from('user_profiles')
      .update({
        last_workout: trainerizeData.last_workout_date,
        total_workouts: trainerizeData.total_workouts,
        current_weight: trainerizeData.current_weight
      })
      .eq('id', client.id)

    // Registrar sincronização
    await supabaseAdmin
      .from('trainerize_sync')
      .insert({
        user_id: client.id,
        trainerize_id: client.trainerize_id,
        sync_status: 'completed',
        sync_data: trainerizeData
      })
  }

  return new Response(JSON.stringify({ synced: clients.length }))
})
```

#### 3.3 Configurar Cron Job no Supabase
```sql
-- No Supabase SQL Editor
SELECT cron.schedule(
  'sync-trainerize-hourly',
  '0 * * * *', -- A cada hora
  $$
  SELECT net.http_post(
    url:='https://[SEU_PROJETO].supabase.co/functions/v1/sync-trainerize',
    headers:='{"Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  ) as request_id;
  $$
);
```

---

### **FASE 4: DASHBOARD INTEGRADO** (3-4 dias)
**Prioridade:** Média

#### 4.1 Atualizar `dashboard.html` com dados do Trainerize
```html
<!-- Adicionar seção de progresso Trainerize -->
<div class="card bg-panel">
  <div class="card-body">
    <h5 class="card-title">📱 Trainerize Progress</h5>
    <div id="trainerize-stats">
      <div class="stat-item">
        <span class="stat-label">Workouts Completed</span>
        <span class="stat-value" id="total-workouts">--</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Last Workout</span>
        <span class="stat-value" id="last-workout">--</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Streak</span>
        <span class="stat-value" id="workout-streak">--</span>
      </div>
    </div>
    <a href="#" id="open-trainerize-app" class="btn btn-outline-warning mt-3">
      Open Trainerize App
    </a>
  </div>
</div>
```

#### 4.2 Criar `js/trainerize-integration.js`
```javascript
// Garcia Builder - Trainerize Integration
(async function() {
  'use strict';

  const API_URL = 'https://[SEU_PROJETO].supabase.co/functions/v1';

  // Fetch Trainerize data for current user
  async function loadTrainerizeData() {
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (!user) return;

      // Get user profile with trainerize_id
      const { data: profile } = await window.supabaseClient
        .from('user_profiles')
        .select('trainerize_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.trainerize_id) {
        showTrainerizeSetup();
        return;
      }

      // Fetch Trainerize stats
      const response = await fetch(`${API_URL}/get-trainerize-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await window.supabaseClient.auth.getSession()).data.session.access_token}`
        },
        body: JSON.stringify({ trainerize_id: profile.trainerize_id })
      });

      const stats = await response.json();
      updateDashboard(stats);
    } catch (error) {
      console.error('Error loading Trainerize data:', error);
    }
  }

  function updateDashboard(stats) {
    document.getElementById('total-workouts').textContent = stats.total_workouts || 0;
    document.getElementById('last-workout').textContent = formatDate(stats.last_workout_date);
    document.getElementById('workout-streak').textContent = `${stats.streak || 0} days`;
  }

  function formatDate(dateString) {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }

  function showTrainerizeSetup() {
    document.getElementById('trainerize-stats').innerHTML = `
      <div class="alert alert-info">
        <strong>Setup Required</strong>
        <p>Your Trainerize account will be created after your first payment.</p>
        <a href="pricing.html" class="btn btn-primary btn-sm">View Plans</a>
      </div>
    `;
  }

  // Auto-load on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTrainerizeData);
  } else {
    loadTrainerizeData();
  }

  // Expose for manual refresh
  window.GarciaTrainerize = { loadTrainerizeData };
})();
```

---

### **FASE 5: EMAIL DE ONBOARDING** (1-2 dias)
**Prioridade:** Alta

#### 5.1 Criar template de email
```html
<!-- Usar Resend ou SendGrid -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #0b1220; color: #e5e7eb; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 30px 0; }
    .logo { width: 100px; }
    .title { font-size: 28px; color: #f5b64f; margin: 20px 0; }
    .button { background: linear-gradient(135deg, #f8e08e, #f5b64f);
              color: #0b1220; padding: 15px 30px; text-decoration: none;
              border-radius: 8px; display: inline-block; margin: 20px 0; }
    .section { background: #0f172a; padding: 20px; border-radius: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://garciabuilder.fitness/Logo%20Files/For%20Web/logo-nobackground-500.png"
           alt="Garcia Builder" class="logo">
      <h1 class="title">Welcome to Garcia Builder! 🎉</h1>
    </div>

    <div class="section">
      <h2>Your Account is Ready</h2>
      <p>Hi {{first_name}},</p>
      <p>I'm excited to start this transformation journey with you!</p>
      <p>Your Trainerize account has been created. Here's what to do next:</p>
    </div>

    <div class="section">
      <h3>📱 Step 1: Download the App</h3>
      <p>Download Trainerize on your phone:</p>
      <a href="https://apps.apple.com/app/trainerize/id500311007" class="button">
        iOS App Store
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.trainerize.trainerize" class="button">
        Google Play
      </a>
    </div>

    <div class="section">
      <h3>🔑 Step 2: Login Credentials</h3>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Temporary Password:</strong> {{temp_password}}</p>
      <p><em>(Change it after first login)</em></p>
    </div>

    <div class="section">
      <h3>📋 Step 3: Complete Your Profile</h3>
      <ul>
        <li>Add your current stats (weight, measurements)</li>
        <li>Upload a progress photo</li>
        <li>Fill out the intake questionnaire</li>
      </ul>
    </div>

    <div class="section">
      <h3>💬 Step 4: Connect on App chat</h3>
      <p>I'll add you to the client support group within 24h.</p>
      <a href="https://wa.me/447508497586?text=Hi%20Andre!%20Just%20signed%20up!" class="button">
        Message Me
      </a>
    </div>

    <div class="section">
      <h3>🎯 What Happens Next?</h3>
      <p>Within 48 hours, you'll receive:</p>
      <ul>
        <li>✅ Your personalized training program</li>
        <li>✅ Nutrition guidelines</li>
        <li>✅ Weekly check-in schedule</li>
      </ul>
    </div>

    <p style="text-align: center; margin-top: 40px;">
      Let's build something great together! 💪<br>
      <strong>Andre Garcia</strong>
    </p>
  </div>
</body>
</html>
```

#### 5.2 Integrar Resend para envio
```typescript
// supabase/functions/send-welcome-email/index.ts

import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

async function sendWelcomeEmail(user: any, trainerizeClient: any) {
  await resend.emails.send({
    from: 'Garcia Builder <noreply@garciabuilder.fitness>',
    to: user.email,
    subject: '🎉 Welcome to Garcia Builder - Your Account is Ready!',
    html: welcomeEmailTemplate({
      first_name: user.full_name.split(' ')[0],
      email: user.email,
      temp_password: trainerizeClient.temporary_password
    })
  })
}
```

---

### **FASE 6: WHATSAPP AUTOMATION** (1 dia)
**Prioridade:** Média

#### 6.1 Integrar Twilio para App chat
```typescript
// supabase/functions/send-whatsapp/index.ts

import twilio from 'https://esm.sh/twilio@4.0.0'

const client = twilio(
  Deno.env.get('TWILIO_ACCOUNT_SID'),
  Deno.env.get('TWILIO_AUTH_TOKEN')
)

async function sendApp chatWelcome(user: any) {
  await client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox
    to: `whatsapp:${user.phone}`,
    body: `
Hi ${user.full_name.split(' ')[0]}! 👋

Welcome to Garcia Builder! 🎉

Your Trainerize account is ready. Check your email for login details.

Download the app:
📱 iOS: https://apps.apple.com/app/trainerize/id500311007
📱 Android: https://play.google.com/store/apps/details?id=com.trainerize.trainerize

I'll be in touch within 24h to start your program.

Let's do this! 💪
Andre
    `
  })
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Preparação (Antes de começar):**
- [ ] Verificar se tem plano Business no Trainerize
- [ ] Obter API Key do Trainerize
- [ ] Criar conta Resend (envio de emails)
- [ ] Criar conta Twilio (App chat opcional)
- [ ] Backup completo do Supabase

### **Fase 1 - Setup:**
- [ ] Configurar API Key do Trainerize
- [ ] Criar tabela `trainerize_config`
- [ ] Testar endpoints da API manualmente

### **Fase 2 - Webhook:**
- [ ] Criar Edge Function `stripe-to-trainerize`
- [ ] Deploy no Supabase
- [ ] Configurar webhook no Stripe
- [ ] Testar com pagamento real em modo test

### **Fase 3 - Sincronização:**
- [ ] Adicionar coluna `trainerize_id` em `user_profiles`
- [ ] Criar tabela `trainerize_sync`
- [ ] Criar Edge Function `sync-trainerize`
- [ ] Configurar Cron Job
- [ ] Testar sincronização manual

### **Fase 4 - Dashboard:**
- [ ] Atualizar `dashboard.html` com seção Trainerize
- [ ] Criar `js/trainerize-integration.js`
- [ ] Adicionar botão "Open in Trainerize"
- [ ] Testar visualização de stats

### **Fase 5 - Emails:**
- [ ] Criar template de email de boas-vindas
- [ ] Configurar Resend
- [ ] Criar Edge Function `send-welcome-email`
- [ ] Testar envio

### **Fase 6 - App chat:**
- [ ] Configurar Twilio
- [ ] Criar Edge Function `send-whatsapp`
- [ ] Testar mensagem
- [ ] Adicionar ao fluxo do webhook

---

## 🔐 VARIÁVEIS DE AMBIENTE

Adicionar no Supabase Settings → Edge Functions → Secrets:

```bash
TRAINERIZE_API_KEY=trainerize_xxx...
TRAINERIZE_TRAINER_ID=xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
RESEND_API_KEY=re_xxx...
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
```

---

## 🧪 TESTES

### **Teste End-to-End:**
1. Fazer pagamento teste no Stripe
2. Verificar se webhook foi recebido
3. Confirmar criação de usuário no Supabase
4. Confirmar criação de cliente no Trainerize
5. Verificar recebimento de email
6. Verificar recebimento de App chat (se configurado)
7. Login no dashboard
8. Verificar stats do Trainerize aparecendo

### **Teste de Erro:**
1. Simular falha na API do Trainerize
2. Verificar se erro é logado
3. Confirmar retry automático
4. Testar recuperação manual

---

## 📈 MÉTRICAS DE SUCESSO

- ✅ **Tempo de onboarding:** De manual (2-4 horas) → Automático (<5 minutos)
- ✅ **Taxa de ativação:** >85% dos clientes logam no Trainerize em 24h
- ✅ **Redução de suporte:** 70% menos perguntas sobre "como acessar o app"
- ✅ **Satisfação:** NPS >80 no primeiro check-in

---

## 💰 CUSTOS ESTIMADOS

| Serviço | Custo Mensal | Notas |
|---------|--------------|-------|
| Trainerize Business | $50-100 | Depende do plano |
| Resend (Emails) | $10-20 | 3.000 emails/mês grátis |
| Twilio (App chat) | $20-50 | Opcional, $0.005/msg |
| Supabase Edge Functions | Incluído | Free tier: 500k req/mês |
| **TOTAL** | **$80-170/mês** | Paga-se com 2-3 clientes novos |

---

## 🚀 PRÓXIMOS PASSOS

1. **Imediato (Esta semana):**
   - Obter API Key do Trainerize
   - Criar Edge Function do webhook
   - Testar com 1 cliente real

2. **Curto prazo (Este mês):**
   - Implementar sincronização
   - Adicionar dashboard integrado
   - Setup de emails

3. **Médio prazo (Próximo mês):**
   - App chat automation
   - Relatórios avançados
   - Mobile app notifications

---

## 📞 SUPORTE

**Documentação:**
- Trainerize API: https://trainerize.me/api
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Webhooks: https://stripe.com/docs/webhooks

**Contato:**
- Andre Garcia: andrenjulio072@gmail.com
- Supabase Support: support@supabase.io

---

**✅ PRONTO PARA COMEÇAR!**

Comece pela **Fase 1** e avance passo a passo. Documente tudo e faça backups regulares.

🎯 **Meta:** Ter a integração básica funcionando em 7-10 dias.


