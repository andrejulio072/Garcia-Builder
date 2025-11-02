# 📁 Guia para File:// Protocol

## Seu Ambiente

Você está abrindo os arquivos HTML diretamente do sistema de arquivos usando `file://` protocol (não localhost).

**URL Atual:** `file:///c:/dev/Garcia-Builder/pages/auth/login.html`

## Mudanças Aplicadas para File://

### ✅ **Loop Prevenção Especial**

Quando detecta `file://` protocol:

1. **NUNCA redireciona automaticamente** da página de login
2. **Limpa dados obsoletos** automaticamente
3. **Mantém email lembrado** para conveniência
4. **Permite login fresco** toda vez

### ✅ **Aviso Visual**

Um alerta amarelo aparece no topo da página informando:

```
📁 Running via File Protocol

Note: You're opening this page directly from your file system (file://).

• Email/Password login: ✅ Works
• OAuth (Google/Facebook): ❌ Won't work (requires http/https)

Recommended: Use a local server (python -m http.server 8000) for full functionality.
```

### ✅ **OAuth Desabilitado**

Botões de Google e Facebook ficam:
- Desabilitados automaticamente
- Com opacidade reduzida
- Com mensagem "OAuth not available on file:// protocol"

## Como Funciona Agora (File://)

### Login com Email/Password:

1. ✅ Abra `file:///c:/dev/Garcia-Builder/pages/auth/login.html`
2. ✅ Página carrega sem loop
3. ✅ Digite email e senha
4. ✅ Clique "Sign In"
5. ✅ Sistema salva localmente
6. ✅ Redireciona para dashboard

### ⚠️ **Limitações em File://**

| Recurso | Status | Motivo |
|---------|--------|--------|
| Email/Password Login | ✅ Funciona | Não precisa de servidor |
| Registro | ✅ Funciona | Não precisa de servidor |
| OAuth (Google) | ❌ Não funciona | Requer http/https para callback |
| OAuth (Facebook) | ❌ Não funciona | Requer http/https para callback |
| Supabase Session | ⚠️ Limitado | Pode não persistir entre páginas |
| LocalStorage | ✅ Funciona | Funciona normalmente |

## Recomendação: Usar Servidor Local

### Opção 1: Python (Mais Fácil)

```powershell
# No PowerShell, navegue até a pasta
cd c:\dev\Garcia-Builder

# Inicie servidor na porta 8000
python -m http.server 8000

# Acesse no navegador:
# http://localhost:8000/pages/auth/login.html
```

### Opção 2: Node.js

```powershell
# Instalar http-server (uma vez)
npm install -g http-server

# Iniciar servidor
cd c:\dev\Garcia-Builder
http-server -p 8000

# Acesse: http://localhost:8000/pages/auth/login.html
```

### Opção 3: PHP

```powershell
# Se tiver PHP instalado
cd c:\dev\Garcia-Builder
php -S localhost:8000

# Acesse: http://localhost:8000/pages/auth/login.html
```

### Opção 4: VS Code Live Server

1. Instale extensão "Live Server" no VS Code
2. Clique com botão direito em `login.html`
3. Selecione "Open with Live Server"
4. Abre automaticamente no navegador

## Comportamento Correto Agora

### ✅ **File:// Protocol:**

```
📁 Abrir login.html
   ↓
🛡️ Loop Prevention detecta file://
   ↓
🧹 Limpa gb_current_user (se existir)
   ↓
✅ Página carrega normalmente
   ↓
📝 Usuário pode digitar credenciais
   ↓
🔐 Login processa
   ↓
✅ Salva em localStorage
   ↓
↗️ Redireciona para dashboard
```

### ✅ **Localhost (Recomendado):**

```
🌐 http://localhost:8000/pages/auth/login.html
   ↓
🛡️ Loop Prevention ativo (modo http)
   ↓
🔍 Verifica sessão Supabase
   ↓
   ├─ ✅ Sessão válida → Redireciona dashboard
   ├─ ❌ Sem sessão → Fica na página
   └─ 🔄 Loop detectado → Mostra alerta
   ↓
📝 Usuário faz login
   ↓
☁️ Cria sessão Supabase
   ↓
✅ OAuth também funciona
```

## Testes no File://

### Teste 1: Abrir Login
```powershell
# Abrir diretamente
Start-Process "c:\dev\Garcia-Builder\pages\auth\login.html"
```

**Esperado:**
- ✅ Página carrega
- ✅ Aviso amarelo aparece no topo
- ✅ Campos de email/senha habilitados
- ✅ OAuth buttons desabilitados

### Teste 2: Login Local
1. Digite email: `test@example.com`
2. Digite senha: `password123`
3. Clique "Sign In"

**Esperado:**
- ✅ Login processa
- ✅ Salva em localStorage
- ✅ Redireciona para dashboard

### Teste 3: Abrir Novamente
```powershell
# Fechar e reabrir login.html
Start-Process "c:\dev\Garcia-Builder\pages\auth\login.html"
```

**Esperado:**
- ✅ Dados antigos são limpos automaticamente
- ✅ Página carrega limpa
- ✅ SEM loop
- ✅ Pode fazer login novamente

## Console Logs (File://)

Você verá:

```
📁 Running on file:// protocol
🛡️ Loop Prevention Guard Active (file:// mode)
⚠️ Found gb_current_user on file:// login page
📁 Clearing stale data to prevent confusion...
Previous user: andre.garcia@puregym.com
✅ Keeping remembered email: andre.garcia@puregym.com
```

## Resolução de Problemas

### "Página ainda em loop?"

```javascript
// Cole no console (F12):
localStorage.clear();
location.reload();
```

### "OAuth não funciona?"

Normal! OAuth requer servidor (http/https). Use email/password ou inicie servidor local.

### "Dados não salvam?"

File:// tem limitações de segurança. Recomendamos usar localhost.

### "Como voltar para localhost?"

```powershell
# Terminal PowerShell:
cd c:\dev\Garcia-Builder
python -m http.server 8000

# No navegador:
# http://localhost:8000/pages/auth/login.html
```

## Arquivos Modificados

| Arquivo | Mudança | Para File:// |
|---------|---------|--------------|
| js/core/auth.js | Detecta file:// | Limpa dados, sem redirect |
| js/utils/loop-prevention.js | Modo especial | Limpeza automática |
| pages/auth/login.html | Aviso visual | Mostra limitações |

## Próximos Passos

**AGORA:**
1. ✅ Abra `login.html` via file://
2. ✅ Veja o aviso amarelo
3. ✅ Campos devem estar liberados
4. ✅ Faça login com email/senha

**DEPOIS (Recomendado):**
1. Inicie servidor local
2. Use `http://localhost:8000`
3. OAuth funcionará
4. Melhor experiência geral

---

**🎯 Agora deve funcionar perfeitamente em file:// sem loop!**
