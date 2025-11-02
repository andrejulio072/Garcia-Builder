# 🔍 GUIA DE DIAGNÓSTICO - AUTENTICAÇÃO SUPABASE

## Problema Identificado
Você tem dados no localStorage mas `await window.supabaseClient.auth.getUser()` não retorna nada.

## Possíveis Causas

1. **Cliente Supabase não inicializado** - A biblioteca não carregou corretamente
2. **Token expirado** - A sessão no localStorage está desatualizada
3. **Storage key incorreto** - Supabase está procurando em chave diferente
4. **Ordem de carregamento** - Scripts carregando fora de ordem

## Passos para Diagnóstico

### 1️⃣ Teste de Inicialização Completo

Abra o arquivo criado para teste:
```
file:///c:/dev/Garcia-Builder/test-supabase-init.html
```

Ou pelo servidor local:
```
http://localhost:8000/test-supabase-init.html
```

Este arquivo vai mostrar:
- ✅ Status das variáveis de ambiente
- ✅ Status da biblioteca Supabase
- ✅ Status do cliente Supabase
- ✅ Dados no localStorage
- ✅ Testes de getUser() e getSession()

### 2️⃣ Diagnóstico no Console

Abra o Console do navegador (F12) e cole este comando:

```javascript
// Verificar se o cliente está disponível
console.log('Client:', window.supabaseClient);
console.log('Auth:', window.supabaseClient?.auth);

// Testar getUser
const { data, error } = await window.supabaseClient.auth.getUser();
console.log('User:', data, 'Error:', error);

// Testar getSession
const { data: session, error: sessionError } = await window.supabaseClient.auth.getSession();
console.log('Session:', session, 'Error:', sessionError);
```

Ou use o script de diagnóstico completo:

```javascript
// Cole todo o conteúdo de js/utils/supabase-diagnostic.js no console
```

### 3️⃣ Verificar LocalStorage

No Console:

```javascript
// Listar todas as chaves de auth
Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-') || k.includes('gb_'))

// Ver o token do Supabase (ajuste o nome do projeto se necessário)
JSON.parse(localStorage.getItem('sb-qejtjcaldnuokoofpqap-auth-token'))
```

### 4️⃣ Forçar Refresh da Sessão

Se houver token mas sem usuário ativo:

```javascript
// Tentar recuperar a sessão
const { data, error } = await window.supabaseClient.auth.refreshSession();
console.log('Refresh result:', data, error);

// Verificar usuário novamente
const { data: user } = await window.supabaseClient.auth.getUser();
console.log('User after refresh:', user);
```

## Soluções Comuns

### Solução 1: Cliente Não Inicializado

Se `window.supabaseClient` for `undefined`:

```javascript
// Esperar pela inicialização
if (window.waitForSupabaseClient) {
    await window.waitForSupabaseClient();
    console.log('Client ready:', window.supabaseClient);
} else {
    console.error('waitForSupabaseClient not available');
}
```

### Solução 2: Limpar e Relogar

Se a sessão estiver corrompida:

```javascript
// Limpar tudo
localStorage.clear();

// OU limpar apenas auth
Object.keys(localStorage)
    .filter(k => k.includes('supabase') || k.includes('sb-') || k.includes('gb_'))
    .forEach(k => localStorage.removeItem(k));

// Recarregar página
location.reload();

// Fazer login novamente
```

### Solução 3: Verificar Storage Key

O Supabase usa uma chave específica baseada no projeto:

```javascript
// O formato esperado é: sb-{PROJECT_REF}-auth-token
// Para o projeto qejtjcaldnuokoofpqap:
const expectedKey = 'sb-qejtjcaldnuokoofpqap-auth-token';

// Verificar se existe
const hasCorrectKey = localStorage.getItem(expectedKey);
console.log('Has correct key:', !!hasCorrectKey);

// Listar todas as chaves sb-*
const sbKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-'));
console.log('All Supabase keys:', sbKeys);
```

### Solução 4: Reconfigurar Cliente

Se nada funcionar, recriar o cliente:

```javascript
// Destruir cliente atual
window.supabaseClient = null;

// Recarregar supabase.js
const script = document.createElement('script');
script.src = '/js/core/supabase.js?v=' + Date.now();
document.head.appendChild(script);

// Esperar e testar
await new Promise(resolve => setTimeout(resolve, 2000));
const { data } = await window.supabaseClient.auth.getUser();
console.log('User after recreate:', data);
```

## Checklist de Verificação

- [ ] `window.supabaseClient` está definido
- [ ] `window.supabaseClient.auth` está definido
- [ ] Existe token no localStorage (chave `sb-{project}-auth-token`)
- [ ] `getSession()` retorna sessão válida
- [ ] `getUser()` retorna usuário
- [ ] Token não está expirado (verificar `expires_at`)
- [ ] Scripts carregam nesta ordem:
  1. `env.js`
  2. `@supabase/supabase-js`
  3. `supabase.js`
  4. `auth.js`

## Arquivos Modificados

✅ **js/core/supabase.js**
- Adicionado `waitForSupabaseLib()` para aguardar biblioteca
- Adicionado configuração de auth storage
- Adicionado debug de sessão na inicialização

✅ **pages/public/my-profile.html**
- Adicionado espera por Supabase antes de inicializar
- Adicionado logs de diagnóstico
- Adicionado teste de sessão no carregamento

✅ **test-supabase-init.html** (NOVO)
- Página de diagnóstico visual completa
- Testes automáticos de todos os componentes

✅ **js/utils/supabase-diagnostic.js** (NOVO)
- Script de diagnóstico para console
- Análise completa e recomendações

## Próximos Passos

1. Abra `test-supabase-init.html` no navegador
2. Clique em "Test getUser()" e "Test getSession()"
3. Veja os resultados e possíveis erros
4. Se necessário, use o script de diagnóstico no console
5. Reporte o que encontrou

## Comandos Úteis para o PowerShell

```powershell
# Iniciar servidor local (se não estiver rodando)
cd c:\dev\Garcia-Builder
python -m http.server 8000

# OU com Node.js
npx http-server -p 8000

# Abrir teste no navegador
Start-Process "http://localhost:8000/test-supabase-init.html"
```

## Contato

Se o problema persistir após estes testes, reporte:
1. Resultado do `test-supabase-init.html`
2. Output do script de diagnóstico no console
3. Conteúdo de `localStorage` (chaves sb-*)
4. Mensagens de erro no console do navegador
