# ⚡ Guia Rápido: Configuração Supabase OAuth

## 🎯 Ação Imediata Necessária

Após aplicar as correções no código, você **DEVE** atualizar as URLs de redirecionamento no Supabase Dashboard.

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto **Garcia Builder**

### 2. Navegue para Configurações de Autenticação

```
Authentication → URL Configuration
```

### 3. Atualize Site URL

**Campo: Site URL**

Se estiver usando domínio customizado:
```
https://garciabuilder.fitness
```

Se estiver usando GitHub Pages:
```
https://andrejulio072.github.io/Garcia-Builder
```

### 4. Atualize Redirect URLs

**Campo: Redirect URLs**

Cole as seguintes URLs (uma por linha):

#### Produção (Domínio Customizado)
```
https://garciabuilder.fitness/pages/public/dashboard.html
```

#### Produção (GitHub Pages) - Se aplicável
```
https://andrejulio072.github.io/Garcia-Builder/pages/public/dashboard.html
```

#### Desenvolvimento Local
```
http://localhost:3000/pages/public/dashboard.html
http://localhost:5500/pages/public/dashboard.html
http://localhost:8080/pages/public/dashboard.html
http://127.0.0.1:3000/pages/public/dashboard.html
http://127.0.0.1:5500/pages/public/dashboard.html
```

### 5. Remova URLs Antigas (IMPORTANTE!)

**REMOVA** estas URLs antigas se existirem:
```
❌ https://garciabuilder.fitness/dashboard.html
❌ https://andrejulio072.github.io/Garcia-Builder/dashboard.html
❌ http://localhost:3000/dashboard.html
❌ http://localhost:5500/dashboard.html
```

### 6. Salve as Configurações

Clique em **Save** ou **Update** no final da página.

## 🔍 Verificação Rápida

### Antes das Mudanças
```
❌ Redirect URL: https://garciabuilder.fitness/dashboard.html
   (Página intermediária - errado!)
```

### Depois das Mudanças
```
✅ Redirect URL: https://garciabuilder.fitness/pages/public/dashboard.html
   (Dashboard real - correto!)
```

## 🧪 Como Testar

### Teste 1: Login com Google (Local)

1. Abra: `http://localhost:5500/pages/auth/login.html`
2. Clique em "Continuar com Google"
3. Faça login no Google
4. **Resultado esperado**: Redirecionado para `http://localhost:5500/pages/public/dashboard.html`

### Teste 2: Login com Google (Produção)

1. Abra: `https://garciabuilder.fitness/pages/auth/login.html`
2. Clique em "Continuar com Google"
3. Faça login no Google
4. **Resultado esperado**: Redirecionado para `https://garciabuilder.fitness/pages/public/dashboard.html`

## ⚠️ Possíveis Erros

### Erro: "Invalid redirect URI"

**Causa**: URL não está na lista de Redirect URLs do Supabase

**Solução**:
1. Verifique o console do navegador para ver qual URL está sendo usada
2. Adicione essa URL exata no Supabase Dashboard
3. Salve e tente novamente

### Erro: Redirecionando para página em branco

**Causa**: Arquivo `pages/public/dashboard.html` não existe ou tem erros

**Solução**:
1. Verifique se o arquivo existe
2. Abra o console do navegador para ver erros JavaScript
3. Verifique se todos os scripts estão carregando corretamente

## 📱 Google Cloud Console

Se você estiver configurando Google OAuth pela primeira vez, também precisa configurar no Google Cloud Console:

### Authorized JavaScript Origins
```
https://garciabuilder.fitness
http://localhost:5500
```

### Authorized Redirect URIs
```
https://[SEU-PROJETO].supabase.co/auth/v1/callback
```

⚠️ **Nota**: Substitua `[SEU-PROJETO]` pelo seu ID de projeto Supabase

## ✅ Checklist Final

- [ ] Site URL configurada no Supabase
- [ ] Redirect URLs atualizadas no Supabase (com `/pages/public/dashboard.html`)
- [ ] URLs antigas removidas (`/dashboard.html`)
- [ ] Configurações salvas no Supabase
- [ ] Google Cloud Console configurado (se usando Google OAuth)
- [ ] Teste local funcionando
- [ ] Teste em produção funcionando

## 🆘 Precisa de Ajuda?

Se ainda tiver problemas:

1. Verifique o console do navegador (F12)
2. Procure por erros de "redirect" ou "OAuth"
3. Verifique os logs do Supabase: **Authentication → Logs**
4. Compare suas configurações com este guia

---

**⏱️ Tempo estimado**: 5-10 minutos

**🔧 Ferramentas necessárias**:
- Acesso ao Supabase Dashboard
- Acesso ao Google Cloud Console (se usando Google OAuth)

**📅 Data**: 29 de outubro de 2025
