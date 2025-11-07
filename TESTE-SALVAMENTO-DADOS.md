# 🧪 TESTE DE SALVAMENTO DE DADOS - PASSO A PASSO

**Data**: 05/11/2025
**Branch**: feature/remove-whatsapp-public-phase2
**Servidor**: http://localhost:8000
**Objetivo**: Verificar se dados são salvos E recuperados corretamente

---

## 📋 PRÉ-REQUISITOS

✅ Servidor HTTP rodando na porta 8000
✅ Browser com DevTools (Chrome/Edge recomendado)
✅ Usuário autenticado no sistema

---

## 🎯 TESTE 1: Diagnóstico de LocalStorage

### Passo 1: Abrir Página de Diagnóstico
```
URL: http://localhost:8000/tests/test-localStorage-diagnostic.html
```

### O que observar:
- [ ] Página carrega corretamente
- [ ] Seção "Chaves de Autenticação" mostra dados
- [ ] Seção "Chaves de Perfil" mostra dados (se já houver save anterior)
- [ ] Seção "Usuário Atual (gb_current_user)" mostra dados

### Resultado Esperado:
```
✅ Chaves de Autenticação: 1 encontrada
   - sb-qejtjcaldnuokoofpqap-auth-token
   - user_id: [seu-user-id]
   - email: [seu-email]

✅ Chaves de Perfil:
   - Se vazio: Primeira vez usando
   - Se tem dados: Mostra garcia_profile_[user-id]

✅ Usuário Atual: Encontrado
   - id: [user-id]
   - email: [email]
```

### 📸 AÇÃO:
**Tire screenshot desta página e cole aqui**

---

## 🎯 TESTE 2: Salvar Dados no Perfil

### Passo 2: Abrir My Profile
```
URL: http://localhost:8000/pages/public/my-profile.html
```

### Passo 3: Abrir DevTools Console (F12)
- Clicar na aba "Console"
- Limpar console (botão 🚫 ou Ctrl+L)

### Passo 4: Preencher Formulário "Basic Information"
Preencha os seguintes campos:

**Full Name**: Andre Garcia Test
**Phone Number**: +44 7354 757954
**Birthday**: 01/01/1990
**Location**: London, UK
**Bio**: Professional fitness trainer
**Goals**: Selecione 2-3 (ex: Muscle Gain, Strength)
**Experience Level**: Advanced
**Trainer Name**: Andre Garcia

### Passo 5: Salvar
- Clicar no botão "💾 Save Changes"
- **NÃO FECHE A PÁGINA AINDA**

### O que observar no console:
```
🔥 saveProfileData START - section: basic
📊 Current profileData snapshot: {...}
💾 Saving profile (basic)...
☁️ Attempting Supabase save...
✅ Saved to Supabase (ou ⚠️ se falhar)
💿 Saving to localStorage...
✅ Saved to localStorage
✅ localStorage verification: data exists
✅ Section basic found in localStorage
✓ Profile saved successfully
```

### Verificação Visual:
- [ ] Notificação de sucesso aparece
- [ ] Campos permanecem preenchidos
- [ ] Seção "Saved Profile Overview" (lado direito) mostra os dados

### 📸 AÇÃO:
**Tire screenshot do console E da UI mostrando dados salvos**

---

## 🎯 TESTE 3: Verificar Dados Salvos (SEM REFRESH)

### Passo 6: Abrir Console do Browser
No mesmo console onde está my-profile.html aberto, cole:

```javascript
// Verificar localStorage
const userId = JSON.parse(localStorage.getItem('gb_current_user'))?.id;
const profileKey = `garcia_profile_${userId}`;
const savedData = JSON.parse(localStorage.getItem(profileKey));

console.log('🔍 USER ID:', userId);
console.log('🔑 STORAGE KEY:', profileKey);
console.log('💾 SAVED DATA:', savedData);
console.log('📊 BASIC INFO:', savedData?.basic);
```

### Resultado Esperado:
```javascript
🔍 USER ID: "abc-123-def-456"
🔑 STORAGE KEY: "garcia_profile_abc-123-def-456"
💾 SAVED DATA: {basic: {...}, body_metrics: {...}, ...}
📊 BASIC INFO: {
  full_name: "Andre Garcia Test",
  phone: "+44 7354 757954",
  location: "London, UK",
  goals: ["Muscle Gain", "Strength"],
  trainer_name: "Andre Garcia",
  experience_level: "advanced",
  ...
}
```

### 📸 AÇÃO:
**Copie e cole a saída do console aqui**

---

## 🎯 TESTE 4: CRÍTICO - Refresh e Verificar Persistência

### Passo 7: Fazer Refresh da Página
- Pressionar **F5** ou **Ctrl+R**
- Aguardar página recarregar completamente

### Passo 8: Observar Logs de Load
Assim que a página recarregar, observe no console:

```
📥 Loading profile data...
🔍 Current user: [user-id] [email]
🏗️ Default profile structure initialized
📊 BEFORE load - profileData.basic: {full_name: '', phone: '', ...}
☁️ Attempting to load from Supabase...
📊 AFTER Supabase load - profileData.basic: {...}
💿 Loading from localStorage...
💿 loadFromLocalStorage - activeId: [user-id]
🔑 Storage keys to check: ["garcia_profile_guest", "garcia_profile_[user-id]"]
📦 localStorage.getItem("garcia_profile_[user-id]"): {...}
🔍 Parsed snapshot from "garcia_profile_[user-id]": {...}
🔀 Merging snapshot from "garcia_profile_[user-id]"...
📝 BEFORE merge - profileData.basic: {...}
📝 AFTER merge - profileData.basic: {full_name: "Andre Garcia Test", ...}
✅ Merge complete
📊 AFTER localStorage load - profileData.basic: {full_name: "Andre Garcia Test", ...}
✅ Profile data loaded successfully
```

### ⚠️ ATENÇÃO - Verificar UI:
Olhe para a seção **"Saved Profile Overview"** no lado direito:

**TESTE PASSA SE**:
- [ ] Full Name: Andre Garcia Test ✅
- [ ] Phone: +44 7354 757954 ✅
- [ ] Location: London, UK ✅
- [ ] Goals: Muscle Gain, Strength ✅
- [ ] Trainer: Andre Garcia ✅
- [ ] Experience: Advanced ✅

**TESTE FALHA SE**:
- [ ] Full Name: Not provided ❌
- [ ] Phone: Not provided ❌
- [ ] Location: Not provided ❌
- [ ] (Campos vazios)

### 📸 AÇÃO:
**Tire screenshot do console COM TODOS OS LOGS**
**Tire screenshot da UI mostrando "Saved Profile Overview"**

---

## 🎯 TESTE 5: Verificar Dados Após Refresh

### Passo 9: Executar Diagnóstico Final
No console, cole novamente:

```javascript
const userId = JSON.parse(localStorage.getItem('gb_current_user'))?.id;
const profileKey = `garcia_profile_${userId}`;
const savedData = JSON.parse(localStorage.getItem(profileKey));

console.log('=== DIAGNÓSTICO PÓS-REFRESH ===');
console.log('USER ID:', userId);
console.log('STORAGE KEY:', profileKey);
console.log('DADOS EXISTEM?', savedData ? 'SIM ✅' : 'NÃO ❌');
if (savedData) {
  console.log('FULL NAME:', savedData.basic?.full_name);
  console.log('PHONE:', savedData.basic?.phone);
  console.log('LOCATION:', savedData.basic?.location);
  console.log('GOALS:', savedData.basic?.goals);
  console.log('TRAINER:', savedData.basic?.trainer_name);
  console.log('EXPERIENCE:', savedData.basic?.experience_level);
}

// Verificar ProfileManager
console.log('');
console.log('=== PROFILE MANAGER ===');
console.log('profileData global:', window.profileData);
console.log('profileData.basic:', window.profileData?.basic);
```

### Resultado Esperado:
```
=== DIAGNÓSTICO PÓS-REFRESH ===
USER ID: "abc-123-def-456"
STORAGE KEY: "garcia_profile_abc-123-def-456"
DADOS EXISTEM? SIM ✅
FULL NAME: "Andre Garcia Test"
PHONE: "+44 7354 757954"
LOCATION: "London, UK"
GOALS: ["Muscle Gain", "Strength"]
TRAINER: "Andre Garcia"
EXPERIENCE: "advanced"

=== PROFILE MANAGER ===
profileData global: {basic: {...}, body_metrics: {...}, ...}
profileData.basic: {full_name: "Andre Garcia Test", phone: "+44 7354 757954", ...}
```

### 📸 AÇÃO:
**Copie e cole TODO o output do console aqui**

---

## 🎯 TESTE 6: Testar Navegação Entre Abas

### Passo 10: Navegar Entre Abas
- Clicar em diferentes abas: **Metrics**, **Progress**, **Goals**, **Habits**
- Voltar para aba **Basic**

### Verificação:
- [ ] Dados permanecem preenchidos ao voltar para "Basic"
- [ ] Nenhum erro no console
- [ ] "Saved Profile Overview" continua mostrando dados

---

## 📊 RESULTADO FINAL

### ✅ TESTE PASSA SE:
1. ✅ Dados são salvos com sucesso (sem reload)
2. ✅ localStorage contém os dados após save
3. ✅ Após refresh, logs mostram dados sendo carregados
4. ✅ Após refresh, UI mostra dados corretos (não "Not provided")
5. ✅ profileData global contém os dados corretos
6. ✅ Navegação entre abas mantém dados

### ❌ TESTE FALHA SE:
1. ❌ Dados salvam mas não aparecem após refresh
2. ❌ localStorage está vazio após save
3. ❌ Logs mostram "BEFORE merge: {empty}" e "AFTER merge: {empty}"
4. ❌ UI mostra "Not provided" após refresh
5. ❌ profileData global está vazio/resetado

---

## 🐛 SE O TESTE FALHAR

### Cenário A: Dados NÃO salvam no localStorage
**Problema**: saveToLocalStorage() não funciona
**Ação**: Investigar função de save

### Cenário B: Dados salvam mas NÃO carregam
**Problema**: loadFromLocalStorage() ou merge não funciona
**Ação**: Investigar função de load e merge

### Cenário C: Dados carregam mas UI não atualiza
**Problema**: initializeUI() não popula campos
**Ação**: Investigar função de display

---

## 📝 FORMULÁRIO DE REPORTE

Após completar todos os testes, preencha:

### Informações do Sistema:
- Browser: _____________
- Versão: _____________
- User ID: _____________
- Email: _____________

### Resultados:
- [ ] Teste 1: Diagnóstico localStorage - PASSOU / FALHOU
- [ ] Teste 2: Salvar dados - PASSOU / FALHOU
- [ ] Teste 3: Verificar sem refresh - PASSOU / FALHOU
- [ ] Teste 4: Refresh e persistência - PASSOU / FALHOU
- [ ] Teste 5: Diagnóstico pós-refresh - PASSOU / FALHOU
- [ ] Teste 6: Navegação entre abas - PASSOU / FALHOU

### Observações:
```
[Cole aqui qualquer observação adicional, erros encontrados, comportamentos estranhos]
```

---

**PRONTO PARA COMEÇAR! 🚀**

Execute os testes na ordem e envie os screenshots/logs no chat.
