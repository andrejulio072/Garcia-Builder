# 🚀 GUIA DE DEPLOY NO VERCEL

## 📋 PASSO 1: Preparar Environment Variables

1. **Abra o arquivo**: `.env.production`
2. **Substitua os valores** com suas chaves REAIS:
   - `STRIPE_SECRET_KEY` → Sua chave secreta do Stripe (começa com `sk_live_` ou `sk_test_`)
   - `STRIPE_PUBLISHABLE_KEY` → Sua chave pública do Stripe (começa com `pk_live_` ou `pk_test_`)
   - `STRIPE_WEBHOOK_SECRET` → Webhook secret do Stripe (começa com `whsec_`)
   - `SUPABASE_URL` → URL do seu projeto Supabase (ex: `https://gcujqlxunagkptbyhxdn.supabase.co`)
   - `SUPABASE_ANON_KEY` → Chave pública `anon` do Supabase
   - `PRICE_*` → IDs dos seus produtos no Stripe (começa com `price_`)

## 📤 PASSO 2: Upload no Vercel

### Método 1: Import .env (RECOMENDADO)

1. No Vercel, expanda **"Environment Variables"**
2. Clique em **"Import .env"** (ou "paste .env contents above")
3. Abra `.env.production` no VS Code
4. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. **Cole** na caixa de texto do Vercel
6. Clique em **"Add"** ou **"Import"**
7. Confirme que `SUPABASE_URL` e `SUPABASE_ANON_KEY` apareceram listadas

### Método 2: Adicionar Manualmente

Adicione cada variável uma por uma:

| Key                      | Value                                                             | Environment |
| ------------------------ | ----------------------------------------------------------------- | ----------- |
| `NODE_ENV`               | `production`                                                      | Production  |
| `PORT`                   | `3001`                                                            | Production  |
| `STRIPE_SECRET_KEY`      | `sk_test_...`                                                     | Production  |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...`                                                     | Production  |
| `CORS_ORIGINS`           | `https://garciabuilder.fitness,https://www.garciabuilder.fitness` | Production  |
| `SUPABASE_URL`           | `https://gcujqlxunagkptbyhxdn.supabase.co`                         | Production  |
| `SUPABASE_ANON_KEY`      | `eyJhbGciOi...` (anon key do seu projeto)                           | Production  |

## 🎯 PASSO 3: Configurar Build Settings

### Build and Output Settings:

- ✅ **Build Command**: (deixe vazio ou desabilite o toggle)
- ✅ **Output Directory**: `.` (ponto)
- ✅ **Install Command**: `npm install` (ou desabilite)

### Root Directory:

- ✅ Mantenha: `./`

### Framework Preset:

- ✅ Mantenha: **Other**

## 🚀 PASSO 4: Deploy

1. Clique no botão azul **"Deploy"**
2. Aguarde ~1-2 minutos
3. Vercel vai gerar uma URL: `https://garciabuilder-fitness.vercel.app`

## ✅ PASSO 5: Testar

Após deploy completar:

1. Abra a URL gerada
2. Verifique:
   - ✓ Navbar carrega
   - ✓ Footer carrega
   - ✓ Images carregam
   - ✓ Cards alinhados
   - ✓ Menu funciona
   - ✓ Console sem erros

   ### 📄 Gerar env-config.json

   Sempre que atualizar variáveis públicas (Stripe publishable ou Supabase) execute `npm run build:env`. O Vercel roda o mesmo comando automaticamente no deploy (`postinstall`), mas em ambiente local você precisa rodar manualmente para atualizar `env-config.json`.

   ## 🗄️ PASSO 6: Configurar Supabase (se usar funções/cron)

   1. No painel Supabase → **Settings → API → Config**
   2. Adicione segredos:
      - `STRIPE_SECRET_KEY`
      - `STRIPE_WEBHOOK_SECRET`
      - (Opcional) `SUPABASE_SERVICE_KEY` se necessário para servidores externos
   3. Salve e redeploy as Edge Functions se existirem

## 🌐 PASSO 6: Configurar Domínio (Depois)

1. No dashboard Vercel → **Settings** → **Domains**
2. Adicione: `garciabuilder.fitness`
3. Configure DNS conforme instruções do Vercel
4. Aguarde propagação (pode levar até 24h)

---

## ⚠️ IMPORTANTE - CHECKLIST ANTES DE DEPLOY

- [ ] Substituí `STRIPE_SECRET_KEY` com chave REAL
- [ ] Substituí `STRIPE_PUBLISHABLE_KEY` com chave REAL
- [ ] Substituí todos os `PRICE_*` com IDs reais dos produtos
- [ ] Verifiquei que `CORS_ORIGINS` inclui meu domínio
- [ ] Build settings configurados corretamente
- [ ] Root directory é `./`
- [ ] Framework Preset é "Other"

---

## 🆘 TROUBLESHOOTING

### Problema: "Build failed"

**Solução**: Desabilite o Build Command (toggle OFF)

### Problema: "404 on components"

**Solução**: Já resolvido! component-loader.js v2.0 usa paths relativos

### Problema: "API routes not working"

**Solução**: Verifique se vercel.json está no repositório (já está!)

### Problema: "Environment variables not found"

**Solução**: Re-importe o .env.production ou adicione manualmente

---

## 📞 SUPORTE

Se precisar de ajuda:

1. Verifique os logs do deploy no Vercel
2. Abra o Console do browser (F12) para erros JavaScript
3. Verifique Network tab para requisições falhando

**Boa sorte com o deploy! 🚀**
