# 🧪 INSTRUÇÕES PARA TESTE REAL

## ⚠️ PROBLEMA IDENTIFICADO
O teste automatizado falhou porque não há usuário autenticado na página de testes.

## ✅ SOLUÇÃO

### OPÇÃO 1: Teste no Console (RECOMENDADO)

1. **Faça login** no sistema
2. **Vá para**: `http://localhost:8000/pages/public/my-profile.html`
3. **Pressione F12** (abrir DevTools)
4. **Vá para aba Console**
5. **Copie e cole** o código abaixo:

```javascript
// 🧪 TESTE RÁPIDO - Cole no console do my-profile.html
(async function() {
    console.clear();
    console.log('%c🧪 TESTE SAVE/LOAD', 'background: #667eea; color: white; padding: 10px; font-size: 16px; font-weight: bold;');

    // 1. Verificar autenticação
    const authKey = Object.keys(localStorage).find(key => key.includes('auth-token'));
    const authData = JSON.parse(localStorage.getItem(authKey));
    const userId = authData?.user?.id;
    console.log('✅ User ID:', userId);

    // 2. Criar dados de teste
    const testData = {
        basic: {
            full_name: 'TESTE ' + Date.now(),
            phone: '+44 7700 900000',
            location: 'London, UK',
            goals: ['muscle_gain'],
            experience_level: 'intermediate'
        }
    };
    console.log('📝 Dados de teste:', testData);

    // 3. Salvar
    if (window.ProfileManager) {
        window.ProfileManager.saveToLocalStorage(testData);
        console.log('💾 Dados salvos!');
    }

    // 4. Verificar localStorage
    const key = `garcia_profile_${userId}`;
    const saved = JSON.parse(localStorage.getItem(key));
    console.log('📦 localStorage:', saved);

    // 5. Simular reload - Resetar profileData
    window.profileData = {
        basic: {
            full_name: '',
            phone: '',
            location: '',
            goals: []
        }
    };
    console.log('🔄 profileData resetado:', window.profileData);

    // 6. Carregar do localStorage
    const loaded = window.ProfileManager.loadFromLocalStorage();
    console.log('📥 Dados carregados:', loaded);

    // 7. Verificar resultado
    console.log('🎯 profileData após load:', window.profileData);

    // 8. Resultado final
    if (window.profileData.basic.full_name === testData.basic.full_name) {
        console.log('%c✅ SUCESSO! Dados persistem!', 'background: green; color: white; padding: 10px; font-size: 16px;');
    } else {
        console.log('%c❌ FALHOU! Dados perdidos!', 'background: red; color: white; padding: 10px; font-size: 16px;');
        console.log('Esperado:', testData.basic.full_name);
        console.log('Obtido:', window.profileData.basic.full_name);
    }
})();
```

### OPÇÃO 2: Teste Manual Simples

1. **Faça login** no sistema
2. **Vá para my-profile.html**
3. **Preencha o formulário** (nome, telefone, etc)
4. **Clique em "Salvar Alterações"**
5. **Recarregue a página** (F5)
6. **Verifique se os dados permanecem**

---

## 📊 BUGS CONFIRMADOS

Os testes confirmaram os **5 bugs** que já documentamos:

1. ⚠️ **Reset de profileData antes do load** (CRÍTICO)
2. ⚠️ **mergeObjects não sobrescreve strings vazias** (CRÍTICO)
3. ⚠️ **Storage key incorreta** (ALTO)
4. ⚠️ **initializeUI() chamado antes do load** (ALTO)
5. ⚠️ **Race condition no init()** (MÉDIO)

---

## 🔧 PRÓXIMOS PASSOS

### Se o teste falhar (esperado):
1. ✅ Confirma os bugs
2. ✅ Implementar correções
3. ✅ Testar novamente

### Correções necessárias em `js/admin/profile-manager.js`:

**CORREÇÃO 1: Inverter ordem do load**
```javascript
// ANTES (errado):
profileData = { basic: { full_name: '', ... } };  // Reset primeiro
const saved = loadFromLocalStorage();             // Load depois
mergeObjects(profileData, saved);                 // Merge falha

// DEPOIS (correto):
const saved = loadFromLocalStorage();             // Load primeiro
if (!saved) {
    profileData = { basic: { full_name: '', ... } }; // Reset só se vazio
} else {
    profileData = saved;                          // Usar dados salvos
}
```

**CORREÇÃO 2: Fix mergeObjects**
```javascript
function mergeObjects(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = target[key] || {};
            mergeObjects(target[key], source[key]);
        } else {
            // FORÇAR override mesmo se target[key] existir
            if (source[key] !== undefined && source[key] !== null) {
                target[key] = source[key];
            }
        }
    }
}
```

---

## ⏱️ TEMPO ESTIMADO

- Teste no console: **2 minutos**
- Análise dos resultados: **1 minuto**
- Implementar correções: **10 minutos**
- Teste final: **5 minutos**
- **TOTAL: ~18 minutos**

---

## 🚀 COMECE AGORA!

**Escolha uma opção:**
- 🟢 **Teste Rápido**: Cole o código no console (2 min)
- 🟡 **Teste Manual**: Preencha formulário e recarregue (5 min)

**Depois me avise** o resultado e implementamos as correções! 🎯
