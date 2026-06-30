# PLANO DE INTEGRAÃ‡ÃƒO MYPTHUB - GARCIA BUILDER (ARQUIVADO)

> **DecisÃ£o de 23 de junho de 2026:** esta integraÃ§Ã£o nÃ£o faz mais parte do roadmap ativo. O produto deve priorizar uma API prÃ³pria para o futuro Garcia Builder Fitness App. My PT Hub pode ser avaliado separadamente como soluÃ§Ã£o temporÃ¡ria, sem acoplamento do banco de dados principal.

**Data:** 8 de Outubro de 2025
**Prioridade:** ðŸ”¥ ALTA
**Status:** ðŸ“‹ PLANEJAMENTO

---

## ðŸŽ¯ OBJETIVO

Integrar o My PT Hub com o site Garcia Builder para **automatizar 100% do fluxo de clientes**, desde o pagamento atÃ© o acesso ao app, eliminando trabalho manual e melhorando a experiÃªncia.

---

## ðŸ“Š SITUAÃ‡ÃƒO ATUAL

### âœ… **O que jÃ¡ temos:**
- MenÃ§Ãµes ao My PT Hub em 7 pÃ¡ginas (index, pricing, about, faq, success, blog)
- Link para perfil: `https://www.mypthub.me/profile/garciabuilder/AndreJulio.Garcia`
- Supabase configurado (auth, user_profiles, body_metrics)
- Sistema de pagamento Stripe funcionando
- App chat integrado
- Dashboard de trainer bÃ¡sico
- Sistema de autenticaÃ§Ã£o completo

### âŒ **O que falta:**
- **API do My PT Hub** nÃ£o estÃ¡ integrada
- Processo manual: pagar â†’ Andre adiciona manualmente no My PT Hub
- Nenhuma sincronizaÃ§Ã£o automÃ¡tica de dados
- Sem webhooks configurados
- Cliente precisa baixar app separadamente (sem onboarding automÃ¡tico)

---

## ðŸ”§ ARQUITETURA DA INTEGRAÃ‡ÃƒO

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    FLUXO AUTOMATIZADO                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

1. Cliente paga no Stripe
   â†“
2. Stripe Webhook â†’ Supabase Edge Function
   â†“
3. Supabase cria user_profile
   â†“
4. Edge Function chama My PT Hub API
   â†“
5. My PT Hub cria conta do cliente
   â†“
6. Envia email com:
   - Link de download do app
   - Credenciais de acesso
   - InstruÃ§Ãµes de onboarding
   â†“
7. Cliente recebe App chat de boas-vindas
   â†“
8. Dashboard mostra status "Active"
```

---

## ðŸ› ï¸ ETAPAS DE IMPLEMENTAÃ‡ÃƒO

### **FASE 1: SETUP INICIAL** (1-2 dias)
**Prioridade:** CrÃ­tica

#### 1.1 Configurar API do My PT Hub
- [ ] Criar conta Business no My PT Hub (se necessÃ¡rio upgrade)
- [ ] Obter API Key no painel do My PT Hub
- [ ] Estudar documentaÃ§Ã£o: https://mypthub.me/api
- [ ] Testar endpoints principais:
  - `POST /clients` - Criar cliente
  - `GET /clients/{id}` - Buscar cliente
  - `PATCH /clients/{id}` - Atualizar cliente
  - `POST /clients/{id}/workouts` - Adicionar treino

#### 1.2 Armazenar credenciais
```sql
-- Criar tabela para armazenar tokens
CREATE TABLE mypthub_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  base_url TEXT DEFAULT 'https://api.mypthub.com/v1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### **FASE 2: WEBHOOK STRIPE â†’ MYPTHUB** (2-3 dias)
**Prioridade:** CrÃ­tica

#### 2.1 Criar Edge Function no Supabase
```typescript
// supabase/functions/stripe-to-mypthub/index.ts

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

    // 1. Criar usuÃ¡rio no Supabase
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

    // 2. Criar cliente no My PT Hub
    const mypthubResponse = await fetch('https://api.mypthub.com/v1/clients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MYPTHUB_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: session.customer_details.name.split(' ')[0],
        last_name: session.customer_details.name.split(' ').slice(1).join(' '),
        email: session.customer_email,
        phone: session.customer_details.phone,
        plan_id: getMy PT HubPlanId(session.metadata.plan_type)
      })
    })

    const mypthubClient = await mypthubResponse.json()

    // 3. Atualizar Supabase com ID do My PT Hub
    await supabaseAdmin
      .from('user_profiles')
      .update({ mypthub_id: mypthubClient.id })
      .eq('id', user.id)

    // 4. Enviar email de boas-vindas
    await sendWelcomeEmail(user, mypthubClient)

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
2. Adicionar endpoint: `https://[SEU_PROJETO].supabase.co/functions/v1/stripe-to-mypthub`
3. Selecionar eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiar webhook secret

---

### **FASE 3: SINCRONIZAÃ‡ÃƒO DE DADOS** (2-3 dias)
**Prioridade:** Alta

#### 3.1 Atualizar schema do Supabase
```sql
-- Adicionar coluna mypthub_id
ALTER TABLE user_profiles
ADD COLUMN mypthub_id TEXT UNIQUE;

-- Criar tabela de sincronizaÃ§Ã£o
CREATE TABLE mypthub_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  mypthub_id TEXT NOT NULL,
  last_sync TIMESTAMP DEFAULT NOW(),
  sync_status TEXT DEFAULT 'pending',
  sync_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ãndices para performance
CREATE INDEX idx_mypthub_sync_user_id ON mypthub_sync(user_id);
CREATE INDEX idx_mypthub_sync_status ON mypthub_sync(sync_status);
```

#### 3.2 Criar Edge Function para sincronizaÃ§Ã£o periÃ³dica
```typescript
// supabase/functions/sync-mypthub/index.ts

// Roda a cada 1 hora via Supabase Cron
serve(async (req) => {
  // Buscar clientes ativos no Supabase
  const { data: clients } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('subscription_status', 'active')
    .not('mypthub_id', 'is', null)

  for (const client of clients) {
    // Buscar dados atualizados no My PT Hub
    const response = await fetch(
      `https://api.mypthub.com/v1/clients/${client.mypthub_id}`,
      {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MYPTHUB_API_KEY')}`
        }
      }
    )

    const mypthubData = await response.json()

    // Atualizar Supabase com dados do My PT Hub
    await supabaseAdmin
      .from('user_profiles')
      .update({
        last_workout: mypthubData.last_workout_date,
        total_workouts: mypthubData.total_workouts,
        current_weight: mypthubData.current_weight
      })
      .eq('id', client.id)

    // Registrar sincronizaÃ§Ã£o
    await supabaseAdmin
      .from('mypthub_sync')
      .insert({
        user_id: client.id,
        mypthub_id: client.mypthub_id,
        sync_status: 'completed',
        sync_data: mypthubData
      })
  }

  return new Response(JSON.stringify({ synced: clients.length }))
})
```

#### 3.3 Configurar Cron Job no Supabase
```sql
-- No Supabase SQL Editor
SELECT cron.schedule(
  'sync-mypthub-hourly',
  '0 * * * *', -- A cada hora
  $$
  SELECT net.http_post(
    url:='https://[SEU_PROJETO].supabase.co/functions/v1/sync-mypthub',
    headers:='{"Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  ) as request_id;
  $$
);
```

---

### **FASE 4: DASHBOARD INTEGRADO** (3-4 dias)
**Prioridade:** MÃ©dia

#### 4.1 Atualizar `dashboard.html` com dados do My PT Hub
```html
<!-- Adicionar seÃ§Ã£o de progresso My PT Hub -->
<div class="card bg-panel">
  <div class="card-body">
    <h5 class="card-title">ðŸ“± My PT Hub Progress</h5>
    <div id="mypthub-stats">
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
    <a href="#" id="open-mypthub-app" class="btn btn-outline-warning mt-3">
      Open My PT Hub App
    </a>
  </div>
</div>
```

#### 4.2 Criar `js/mypthub-integration.js`
```javascript
// Garcia Builder - My PT Hub Integration
(async function() {
  'use strict';

  const API_URL = 'https://[SEU_PROJETO].supabase.co/functions/v1';

  // Fetch My PT Hub data for current user
  async function loadMy PT HubData() {
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      if (!user) return;

      // Get user profile with mypthub_id
      const { data: profile } = await window.supabaseClient
        .from('user_profiles')
        .select('mypthub_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.mypthub_id) {
        showMy PT HubSetup();
        return;
      }

      // Fetch My PT Hub stats
      const response = await fetch(`${API_URL}/get-mypthub-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await window.supabaseClient.auth.getSession()).data.session.access_token}`
        },
        body: JSON.stringify({ mypthub_id: profile.mypthub_id })
      });

      const stats = await response.json();
      updateDashboard(stats);
    } catch (error) {
      console.error('Error loading My PT Hub data:', error);
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

  function showMy PT HubSetup() {
    document.getElementById('mypthub-stats').innerHTML = `
      <div class="alert alert-info">
        <strong>Setup Required</strong>
        <p>Your My PT Hub account will be created after your first payment.</p>
        <a href="pricing.html" class="btn btn-primary btn-sm">View Plans</a>
      </div>
    `;
  }

  // Auto-load on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMy PT HubData);
  } else {
    loadMy PT HubData();
  }

  // Expose for manual refresh
  window.GarciaMy PT Hub = { loadMy PT HubData };
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
      <h1 class="title">Welcome to Garcia Builder! ðŸŽ‰</h1>
    </div>

    <div class="section">
      <h2>Your Account is Ready</h2>
      <p>Hi {{first_name}},</p>
      <p>I'm excited to start this transformation journey with you!</p>
      <p>Your My PT Hub account has been created. Here's what to do next:</p>
    </div>

    <div class="section">
      <h3>ðŸ“± Step 1: Download the App</h3>
      <p>Download My PT Hub on your phone:</p>
      <a href="https://apps.apple.com/app/mypthub/id500311007" class="button">
        iOS App Store
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.mypthub.mypthub" class="button">
        Google Play
      </a>
    </div>

    <div class="section">
      <h3>ðŸ”‘ Step 2: Login Credentials</h3>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Temporary Password:</strong> {{temp_password}}</p>
      <p><em>(Change it after first login)</em></p>
    </div>

    <div class="section">
      <h3>ðŸ“‹ Step 3: Complete Your Profile</h3>
      <ul>
        <li>Add your current stats (weight, measurements)</li>
        <li>Upload a progress photo</li>
        <li>Fill out the intake questionnaire</li>
      </ul>
    </div>

    <div class="section">
      <h3>ðŸ’¬ Step 4: Connect on App chat</h3>
      <p>I'll add you to the client support group within 24h.</p>
      <a href="https://wa.me/447508497586?text=Hi%20Andre!%20Just%20signed%20up!" class="button">
        Message Me
      </a>
    </div>

    <div class="section">
      <h3>ðŸŽ¯ What Happens Next?</h3>
      <p>Within 48 hours, you'll receive:</p>
      <ul>
        <li>âœ… Your personalized training program</li>
        <li>âœ… Nutrition guidelines</li>
        <li>âœ… Weekly check-in schedule</li>
      </ul>
    </div>

    <p style="text-align: center; margin-top: 40px;">
      Let's build something great together! ðŸ’ª<br>
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

async function sendWelcomeEmail(user: any, mypthubClient: any) {
  await resend.emails.send({
    from: 'Garcia Builder <noreply@garciabuilder.fitness>',
    to: user.email,
    subject: 'ðŸŽ‰ Welcome to Garcia Builder - Your Account is Ready!',
    html: welcomeEmailTemplate({
      first_name: user.full_name.split(' ')[0],
      email: user.email,
      temp_password: mypthubClient.temporary_password
    })
  })
}
```

---

### **FASE 6: WHATSAPP AUTOMATION** (1 dia)
**Prioridade:** MÃ©dia

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
Hi ${user.full_name.split(' ')[0]}! ðŸ‘‹

Welcome to Garcia Builder! ðŸŽ‰

Your My PT Hub account is ready. Check your email for login details.

Download the app:
ðŸ“± iOS: https://apps.apple.com/app/mypthub/id500311007
ðŸ“± Android: https://play.google.com/store/apps/details?id=com.mypthub.mypthub

I'll be in touch within 24h to start your program.

Let's do this! ðŸ’ª
Andre
    `
  })
}
```

---

## ðŸ“‹ CHECKLIST DE IMPLEMENTAÃ‡ÃƒO

### **PreparaÃ§Ã£o (Antes de comeÃ§ar):**
- [ ] Verificar se tem plano Business no My PT Hub
- [ ] Obter API Key do My PT Hub
- [ ] Criar conta Resend (envio de emails)
- [ ] Criar conta Twilio (App chat opcional)
- [ ] Backup completo do Supabase

### **Fase 1 - Setup:**
- [ ] Configurar API Key do My PT Hub
- [ ] Criar tabela `mypthub_config`
- [ ] Testar endpoints da API manualmente

### **Fase 2 - Webhook:**
- [ ] Criar Edge Function `stripe-to-mypthub`
- [ ] Deploy no Supabase
- [ ] Configurar webhook no Stripe
- [ ] Testar com pagamento real em modo test

### **Fase 3 - SincronizaÃ§Ã£o:**
- [ ] Adicionar coluna `mypthub_id` em `user_profiles`
- [ ] Criar tabela `mypthub_sync`
- [ ] Criar Edge Function `sync-mypthub`
- [ ] Configurar Cron Job
- [ ] Testar sincronizaÃ§Ã£o manual

### **Fase 4 - Dashboard:**
- [ ] Atualizar `dashboard.html` com seÃ§Ã£o My PT Hub
- [ ] Criar `js/mypthub-integration.js`
- [ ] Adicionar botÃ£o "Open in My PT Hub"
- [ ] Testar visualizaÃ§Ã£o de stats

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

## ðŸ” VARIÃVEIS DE AMBIENTE

Adicionar no Supabase Settings â†’ Edge Functions â†’ Secrets:

```bash
MYPTHUB_API_KEY=mypthub_xxx...
MYPTHUB_TRAINER_ID=xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...
RESEND_API_KEY=re_xxx...
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=xxx...
```

---

## ðŸ§ª TESTES

### **Teste End-to-End:**
1. Fazer pagamento teste no Stripe
2. Verificar se webhook foi recebido
3. Confirmar criaÃ§Ã£o de usuÃ¡rio no Supabase
4. Confirmar criaÃ§Ã£o de cliente no My PT Hub
5. Verificar recebimento de email
6. Verificar recebimento de App chat (se configurado)
7. Login no dashboard
8. Verificar stats do My PT Hub aparecendo

### **Teste de Erro:**
1. Simular falha na API do My PT Hub
2. Verificar se erro Ã© logado
3. Confirmar retry automÃ¡tico
4. Testar recuperaÃ§Ã£o manual

---

## ðŸ“ˆ MÃ‰TRICAS DE SUCESSO

- âœ… **Tempo de onboarding:** De manual (2-4 horas) â†’ AutomÃ¡tico (<5 minutos)
- âœ… **Taxa de ativaÃ§Ã£o:** >85% dos clientes logam no My PT Hub em 24h
- âœ… **ReduÃ§Ã£o de suporte:** 70% menos perguntas sobre "como acessar o app"
- âœ… **SatisfaÃ§Ã£o:** NPS >80 no primeiro check-in

---

## ðŸ’° CUSTOS ESTIMADOS

| ServiÃ§o | Custo Mensal | Notas |
|---------|--------------|-------|
| My PT Hub Business | $50-100 | Depende do plano |
| Resend (Emails) | $10-20 | 3.000 emails/mÃªs grÃ¡tis |
| Twilio (App chat) | $20-50 | Opcional, $0.005/msg |
| Supabase Edge Functions | IncluÃ­do | Free tier: 500k req/mÃªs |
| **TOTAL** | **$80-170/mÃªs** | Paga-se com 2-3 clientes novos |

---

## ðŸš€ PRÃ“XIMOS PASSOS

1. **Imediato (Esta semana):**
   - Obter API Key do My PT Hub
   - Criar Edge Function do webhook
   - Testar com 1 cliente real

2. **Curto prazo (Este mÃªs):**
   - Implementar sincronizaÃ§Ã£o
   - Adicionar dashboard integrado
   - Setup de emails

3. **MÃ©dio prazo (PrÃ³ximo mÃªs):**
   - App chat automation
   - RelatÃ³rios avanÃ§ados
   - Mobile app notifications

---

## ðŸ“ž SUPORTE

**DocumentaÃ§Ã£o:**
- My PT Hub API: https://mypthub.me/api
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Stripe Webhooks: https://stripe.com/docs/webhooks

**Contato:**
- Andre Garcia: andrenjulio072@gmail.com
- Supabase Support: support@supabase.io

---

**âœ… PRONTO PARA COMEÃ‡AR!**

Comece pela **Fase 1** e avance passo a passo. Documente tudo e faÃ§a backups regulares.

ðŸŽ¯ **Meta:** Ter a integraÃ§Ã£o bÃ¡sica funcionando em 7-10 dias.




