# ⚡ TRAINERIZE INTEGRATION - QUICK START

**🎯 Objetivo:** Configurar integração básica Trainerize em 1 dia

---

## 🔥 OPÇÃO 1: SETUP MANUAL (Funciona hoje mesmo)

Se você ainda não tem acesso à API do Trainerize, pode começar com processo semi-automático:

### **Passo 1: Configurar Webhook do Stripe**

Crie um webhook simples que salva dados no Supabase:

```sql
-- Atualizar tabela user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS 
  trainerize_email_sent BOOLEAN DEFAULT FALSE,
  trainerize_pending BOOLEAN DEFAULT TRUE,
  plan_name TEXT,
  payment_date TIMESTAMP;
```

### **Passo 2: Criar Edge Function básica**

```typescript
// supabase/functions/stripe-webhook-simple/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const payload = await req.json()
  
  if (payload.type === 'checkout.session.completed') {
    const session = payload.data.object
    
    // Salvar cliente no Supabase
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        email: session.customer_email,
        full_name: session.customer_details.name,
        phone: session.customer_details.phone,
        plan_name: session.metadata.plan_name,
        payment_date: new Date().toISOString(),
        trainerize_pending: true,
        subscription_status: 'active'
      })
    
    if (error) {
      console.error('Error:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Enviar email para você com os dados
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Garcia Builder <noreply@garciabuilder.fitness>',
        to: 'andrenjulio072@gmail.com',
        subject: '🎉 Novo Cliente - Adicionar no Trainerize',
        html: `
          <h2>Novo Cliente Registrado!</h2>
          <p><strong>Nome:</strong> ${session.customer_details.name}</p>
          <p><strong>Email:</strong> ${session.customer_email}</p>
          <p><strong>Phone:</strong> ${session.customer_details.phone}</p>
          <p><strong>Plano:</strong> ${session.metadata.plan_name}</p>
          <p><strong>Ação:</strong> Adicionar este cliente manualmente no Trainerize</p>
          <hr>
          <a href="https://app.trainerize.me/clients">Ir para Trainerize →</a>
        `
      })
    })
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### **Passo 3: Deploy**

```bash
# No terminal do projeto
cd supabase/functions
supabase functions deploy stripe-webhook-simple --no-verify-jwt

# Copiar URL gerada
```

### **Passo 4: Configurar no Stripe**

1. Ir para: https://dashboard.stripe.com/webhooks
2. Adicionar endpoint com a URL copiada
3. Selecionar evento: `checkout.session.completed`
4. Salvar webhook secret

### **Resultado:**
✅ Você recebe email automático quando alguém pagar  
✅ Dados salvos no Supabase  
✅ Você adiciona manualmente no Trainerize (5 minutos)  
✅ Cliente recebe email de boas-vindas manual  

**Tempo de implementação:** 2-3 horas

---

## 🚀 OPÇÃO 2: SETUP AUTOMÁTICO COM API

Se você já tem API Key do Trainerize:

### **Requisitos:**
- [ ] Trainerize Business Plan
- [ ] API Key obtida
- [ ] Resend API Key (grátis)
- [ ] 4-6 horas disponíveis

### **Script de Deploy Rápido:**

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link ao projeto
supabase link --project-ref [SEU_PROJECT_ID]

# 4. Criar função
mkdir -p supabase/functions/stripe-to-trainerize
cd supabase/functions/stripe-to-trainerize

# 5. Copiar código da TRAINERIZE-INTEGRATION-PLAN.md (Fase 2.1)

# 6. Deploy
supabase functions deploy stripe-to-trainerize

# 7. Configurar secrets
supabase secrets set TRAINERIZE_API_KEY=xxx
supabase secrets set STRIPE_SECRET_KEY=xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=xxx
supabase secrets set RESEND_API_KEY=xxx
```

---

## 📋 CHECKLIST MÍNIMO (1 DIA)

### **Manhã (3 horas):**
- [ ] Criar tabela no Supabase para armazenar clientes
- [ ] Criar Edge Function básica
- [ ] Deploy da função
- [ ] Configurar webhook no Stripe

### **Tarde (2 horas):**
- [ ] Testar com pagamento teste
- [ ] Verificar se email chega
- [ ] Adicionar cliente teste no Trainerize
- [ ] Marcar como "processado" no Supabase

### **Noite (1 hora):**
- [ ] Criar template de email de boas-vindas
- [ ] Automatizar envio para o cliente
- [ ] Documentar processo

---

## 🎯 PRIORIDADES

### **AGORA (Essencial):**
1. ✅ Webhook Stripe → Supabase (salvar dados)
2. ✅ Email para você quando houver novo cliente
3. ✅ Processo manual de adicionar no Trainerize

### **ESTA SEMANA (Importante):**
1. 🔄 Email automático para cliente com instruções
2. 🔄 Dashboard mostrando clientes pendentes
3. 🔄 Botão "Marcar como adicionado no Trainerize"

### **ESTE MÊS (Desejável):**
1. ⏳ Integração completa com API Trainerize
2. ⏳ Sincronização de dados
3. ⏳ WhatsApp automation

---

## 🆘 TROUBLESHOOTING

### **Webhook não está funcionando:**
```bash
# Testar localmente
curl -X POST https://[SEU_PROJETO].supabase.co/functions/v1/stripe-webhook-simple \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed","data":{"object":{"customer_email":"test@test.com"}}}'
```

### **Email não está chegando:**
- Verificar API Key do Resend
- Verificar se domínio está verificado
- Checar spam folder

### **Erro no Supabase:**
```sql
-- Ver logs de erro
SELECT * FROM supabase_functions.logs 
WHERE function_name = 'stripe-webhook-simple' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📞 PRÓXIMO PASSO

**Escolha seu caminho:**

### **Caminho 1: Rápido e Manual**
→ Siga a **OPÇÃO 1** acima  
→ Leva 2-3 horas  
→ Funciona hoje mesmo  
→ Upgrade depois para automático  

### **Caminho 2: Completo e Automático**
→ Siga o **TRAINERIZE-INTEGRATION-PLAN.md** completo  
→ Leva 7-10 dias  
→ 100% automatizado  
→ Zero trabalho manual  

**Recomendação:** Comece com Caminho 1 hoje, upgrade para Caminho 2 esta semana.

---

## ✅ SUCCESS METRICS

Depois de implementar, você deve ver:

- ✅ Novo cliente paga → Você recebe email em <5 minutos
- ✅ Dados do cliente aparecem no Supabase
- ✅ Você adiciona no Trainerize em <10 minutos
- ✅ Cliente recebe email de boas-vindas
- ✅ Zero clientes perdidos no processo

---

**🚀 VAMOS COMEÇAR!**

Primeiro passo: Criar a Edge Function básica acima. Você quer que eu ajude a criar os arquivos necessários?
