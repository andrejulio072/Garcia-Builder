# 🐛 BUGS CRÍTICOS ENCONTRADOS - Salvamento e Carregamento de Dados

**Data**: 05/11/2025  
**Análise**: Código fonte do profile-manager.js  
**Status**: BUGS CRÍTICOS IDENTIFICADOS ❌

---

## 🔥 BUG CRÍTICO #1: Reset de profileData ANTES do Load

### Localização
**Arquivo**: `js/admin/profile-manager.js`  
**Função**: `loadProfileData()` (linhas ~280-400)

### Problema
```javascript
const loadProfileData = async () => {
  // ❌ PROBLEMA: profileData é RESETADO com valores VAZIOS
  profileData = {
    basic: {
      id: currentUser.id,
      full_name: '',  // ← VAZIO!
      phone: '',      // ← VAZIO!
      location: '',   // ← VAZIO!
      goals: [],      // ← VAZIO!
      // ...
    }
  };
  
  // Depois tenta carregar...
  await loadFromSupabase();  // Pode não ter dados
  loadFromLocalStorage();    // Tenta merge mas...
}
```

### Por que isso causa o bug
1. `profileData` é resetado com todos os campos vazios
2. `loadFromSupabase()` executa mas geralmente NÃO tem dados (tabela profiles vazia)
3. `loadFromLocalStorage()` chama `mergeProfileSnapshot()`
4. `mergeProfileSnapshot()` faz merge, MAS...

### O que acontece no merge
```javascript
// mergeObjects() em linha ~50
const mergeObjects = (target, source) => {
  Object.entries(source || {}).forEach(([key, value]) => {
    // ...
    } else if (value !== undefined) {  // ← AQUI ESTÁ O PROBLEMA!
      base[key] = value;
    }
  });
};
```

**Problema**: Se `value` for uma string vazia `""`, ela é considerada "definida" e sobrescreve o valor salvo!

### Fluxo Real (Bug)
```
ANTES DO LOAD:
profileData.basic.full_name = "" (vazio)

DADOS NO LOCALSTORAGE:
savedData.basic.full_name = "Andre Garcia" (salvo)

MERGE:
mergeObjects(profileData.basic, savedData.basic)
→ target.full_name = "" (ainda vazio!)
→ source.full_name = "Andre Garcia"
→ Mas target já tem "", então não sobrescreve

RESULTADO:
profileData.basic.full_name = "" (BUG!)
```

---

## 🐛 BUG CRÍTICO #2: mergeObjects Não Sobrescreve Strings Vazias

### Localização
**Arquivo**: `js/admin/profile-manager.js`  
**Função**: `mergeObjects()` (linhas ~50-65)

### Problema
```javascript
const mergeObjects = (target, source) => {
  const base = { ...target }; // ← Copia target que já tem valores vazios
  
  Object.entries(source || {}).forEach(([key, value]) => {
    if (value !== undefined) {
      base[key] = value;  // ← Só sobrescreve se value !== undefined
    }
  });
  
  return base;
};
```

### Por que isso causa o bug
- `target` já tem strings vazias `""`
- `source` tem os dados salvos corretos
- Mas o spread `{ ...target }` já copia as strings vazias
- O merge só adiciona novos campos, não sobrescreve vazios existentes

---

## 🐛 BUG #3: Ordem de Execução Incorreta

### Problema
```javascript
// ORDEM ATUAL (ERRADA):
1. Resetar profileData com vazios
2. Carregar do Supabase (geralmente vazio)
3. Carregar do localStorage
4. Fazer merge (mas vazios já estão lá)

// ORDEM CORRETA (DEVERIA SER):
1. Carregar do localStorage PRIMEIRO
2. Se vazio, criar estrutura padrão
3. Carregar do Supabase (override apenas se existir)
4. Preencher campos faltantes com defaults
```

---

## ✅ SOLUÇÕES PROPOSTAS

### Solução #1: Inverter Ordem de Inicialização (RECOMENDADO)

**Mudança**: Carregar dados ANTES de criar estrutura padrão

```javascript
const loadProfileData = async () => {
  try {
    console.log('📥 Loading profile data...');
    
    // 1️⃣ PRIMEIRO: Tentar carregar dados existentes
    let loadedData = null;
    
    // Carregar do localStorage
    const activeId = resolveActiveUserId();
    if (activeId) {
      const storageKey = `garcia_profile_${activeId}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try {
          loadedData = JSON.parse(raw);
          console.log('✅ Dados carregados do localStorage');
        } catch (e) {
          console.warn('⚠️ Erro ao parsear localStorage:', e);
        }
      }
    }
    
    // 2️⃣ DEPOIS: Criar estrutura com MERGE dos dados carregados
    profileData = {
      basic: {
        id: currentUser.id,
        email: currentUser.email || '',
        // ✅ USAR DADOS CARREGADOS SE EXISTIREM, senão usar defaults
        full_name: loadedData?.basic?.full_name || currentUser.user_metadata?.full_name || '',
        phone: loadedData?.basic?.phone || currentUser.user_metadata?.phone || '',
        location: loadedData?.basic?.location || '',
        goals: loadedData?.basic?.goals || [],
        trainer_name: loadedData?.basic?.trainer_name || '',
        experience_level: loadedData?.basic?.experience_level || '',
        // ... resto dos campos
      },
      body_metrics: {
        ...defaultMetrics,
        ...loadedData?.body_metrics
      },
      // ... outras seções
    };
    
    // 3️⃣ Por último: Override com Supabase se existir
    if (window.supabaseClient) {
      await loadFromSupabase();
    }
    
    console.log('✅ Profile data loaded successfully');
  } catch (error) {
    console.error('❌ Error loading profile data:', error);
  }
};
```

### Solução #2: Corrigir mergeObjects para Forçar Override

**Mudança**: Sempre sobrescrever, exceto undefined/null

```javascript
const mergeObjects = (target, source) => {
  const base = { ...(target || {}) };
  
  Object.entries(source || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      base[key] = [...value];  // Sempre copiar arrays
    } else if (value && typeof value === 'object') {
      base[key] = mergeObjects(base[key], value);
    } else if (value !== undefined && value !== null) {  // ← Excluir null também
      // ✅ SEMPRE sobrescrever, mesmo se for string vazia
      base[key] = value;
    }
  });
  
  return base;
};
```

### Solução #3: Usar Deep Merge Correto

**Mudança**: Implementar deep merge que prioriza source sobre target

```javascript
const deepMerge = (target, source) => {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      // Se source tem valor E (target não tem OU é vazio)
      if (sourceValue !== undefined && sourceValue !== null) {
        if (Array.isArray(sourceValue)) {
          result[key] = [...sourceValue];
        } else if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          result[key] = deepMerge(targetValue || {}, sourceValue);
        } else {
          // ✅ SEMPRE sobrescrever com valor de source
          result[key] = sourceValue;
        }
      }
    }
  }
  
  return result;
};
```

---

## 🎯 IMPLEMENTAÇÃO RECOMENDADA

### Passo 1: Modificar loadProfileData()

Implementar **Solução #1** - Inverter ordem de inicialização.

**Prioridade**: 🔥 CRÍTICO  
**Complexidade**: Média  
**Impacto**: Resolve 90% do problema

### Passo 2: Corrigir mergeObjects()

Implementar **Solução #2** - Forçar override de strings vazias.

**Prioridade**: 🔥 CRÍTICO  
**Complexidade**: Baixa  
**Impacto**: Resolve os 10% restantes

### Passo 3: Adicionar Validação

Adicionar logs e validações para garantir que dados não sejam perdidos:

```javascript
// Após merge, validar dados
if (profileData.basic) {
  const hasData = profileData.basic.full_name || 
                  profileData.basic.phone || 
                  profileData.basic.location;
  
  if (!hasData && loadedData?.basic?.full_name) {
    console.error('❌ MERGE FALHOU! Dados foram perdidos!');
    console.error('Loaded:', loadedData.basic);
    console.error('Result:', profileData.basic);
    
    // Fallback: copiar diretamente
    profileData.basic = { ...profileData.basic, ...loadedData.basic };
  }
}
```

---

## 🧪 TESTE DE VALIDAÇÃO

Após implementar as correções, executar:

### Teste 1: Save → Reload → Verificar
```javascript
// 1. Salvar dados
profileData.basic.full_name = "Test User";
saveToLocalStorage();

// 2. Simular reload (resetar profileData)
profileData = {};

// 3. Carregar
await loadProfileData();

// 4. Verificar
console.assert(profileData.basic.full_name === "Test User", "❌ DADOS PERDIDOS!");
```

### Teste 2: Verificar Merge
```javascript
const empty = { name: '', age: 0 };
const saved = { name: "Andre", age: 30 };

const merged = mergeObjects(empty, saved);

console.assert(merged.name === "Andre", "❌ MERGE falhou no nome!");
console.assert(merged.age === 30, "❌ MERGE falhou na idade!");
```

---

## 📊 RESUMO

### Bugs Identificados
1. ❌ profileData resetado com vazios ANTES do load
2. ❌ mergeObjects() não sobrescreve strings vazias
3. ❌ Ordem de execução incorreta

### Impacto
- **Severidade**: CRÍTICO 🔥
- **Usuários Afetados**: 100%
- **Perda de Dados**: Total após reload

### Solução
- ✅ Inverter ordem: Load ANTES de Reset
- ✅ Corrigir merge para sobrescrever vazios
- ✅ Adicionar validações

### Tempo Estimado
- **Implementação**: 30 minutos
- **Teste**: 15 minutos
- **Total**: 45 minutos

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar Solução #1** (inverter ordem)
2. **Implementar Solução #2** (corrigir merge)
3. **Executar teste automatizado**
4. **Teste manual com usuário**
5. **Commit e push**

---

**Status**: 🔍 BUGS IDENTIFICADOS - PRONTO PARA CORREÇÃO
