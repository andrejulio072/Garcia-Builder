/**
 * 🧪 SCRIPT DE TESTE AUTOMATIZADO - SALVAMENTO DE DADOS
 * 
 * Cole este script no Console do DevTools (F12) na página my-profile.html
 * para executar testes automatizados de salvamento e carregamento de dados.
 */

console.clear();
console.log('%c🧪 INICIANDO TESTES DE SALVAMENTO DE DADOS', 'background: #F6C84E; color: #000; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('');

// Cores para output
const styles = {
  success: 'color: #00ff9d; font-weight: bold;',
  error: 'color: #ff4444; font-weight: bold;',
  warning: 'color: #ff9d00; font-weight: bold;',
  info: 'color: #00ccff; font-weight: bold;',
  section: 'background: #1a1a1a; color: #F6C84E; font-size: 14px; font-weight: bold; padding: 5px;'
};

let testsPassed = 0;
let testsFailed = 0;

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`%c✅ PASSOU: ${name}`, styles.success);
    testsPassed++;
  } else {
    console.log(`%c❌ FALHOU: ${name}`, styles.error);
    if (details) console.log(`   Detalhes: ${details}`);
    testsFailed++;
  }
}

// ============================================
// TESTE 1: Verificar Autenticação
// ============================================
console.log('%c📋 TESTE 1: Verificar Autenticação', styles.section);
const authKeys = Object.keys(localStorage).filter(k => k.includes('auth-token'));
logTest('Chave de autenticação existe', authKeys.length > 0, `Encontradas: ${authKeys.length}`);

if (authKeys.length > 0) {
  const authKey = authKeys[0];
  const authData = JSON.parse(localStorage.getItem(authKey));
  const userId = authData?.user?.id;
  const userEmail = authData?.user?.email;
  
  logTest('User ID presente', !!userId, userId || 'ID não encontrado');
  logTest('Email presente', !!userEmail, userEmail || 'Email não encontrado');
  
  console.log(`   User ID: ${userId}`);
  console.log(`   Email: ${userEmail}`);
} else {
  console.log('%c⚠️ Usuário não autenticado! Faça login primeiro.', styles.warning);
}

console.log('');

// ============================================
// TESTE 2: Verificar gb_current_user
// ============================================
console.log('%c📋 TESTE 2: Verificar gb_current_user', styles.section);
const currentUserRaw = localStorage.getItem('gb_current_user');
logTest('gb_current_user existe', !!currentUserRaw);

if (currentUserRaw) {
  try {
    const currentUser = JSON.parse(currentUserRaw);
    logTest('gb_current_user é JSON válido', true);
    logTest('currentUser tem ID', !!currentUser.id, currentUser.id);
    logTest('currentUser tem email', !!currentUser.email, currentUser.email);
    console.log('   Current User:', currentUser);
  } catch (e) {
    logTest('gb_current_user é JSON válido', false, e.message);
  }
}

console.log('');

// ============================================
// TESTE 3: Verificar Chave de Perfil
// ============================================
console.log('%c📋 TESTE 3: Verificar Chave de Perfil no localStorage', styles.section);
const currentUser = JSON.parse(localStorage.getItem('gb_current_user') || '{}');
const userId = currentUser.id;
const profileKey = `garcia_profile_${userId}`;

console.log(`   Chave esperada: ${profileKey}`);

const profileData = localStorage.getItem(profileKey);
logTest('Chave de perfil existe', !!profileData, profileKey);

if (profileData) {
  try {
    const parsed = JSON.parse(profileData);
    logTest('Dados de perfil são JSON válido', true);
    
    // Verificar seções
    const sections = Object.keys(parsed);
    console.log(`   Seções encontradas: ${sections.join(', ')}`);
    
    logTest('Seção "basic" existe', !!parsed.basic);
    
    if (parsed.basic) {
      const basicFields = {
        full_name: parsed.basic.full_name,
        phone: parsed.basic.phone,
        location: parsed.basic.location,
        goals: parsed.basic.goals,
        trainer_name: parsed.basic.trainer_name,
        experience_level: parsed.basic.experience_level
      };
      
      console.log('   Dados Basic:', basicFields);
      
      // Verificar campos específicos
      logTest('full_name preenchido', !!basicFields.full_name && basicFields.full_name !== '', basicFields.full_name);
      logTest('phone preenchido', !!basicFields.phone && basicFields.phone !== '', basicFields.phone);
      logTest('location preenchido', !!basicFields.location && basicFields.location !== '', basicFields.location);
      logTest('goals é array', Array.isArray(basicFields.goals), `Length: ${basicFields.goals?.length || 0}`);
      logTest('trainer_name preenchido', !!basicFields.trainer_name && basicFields.trainer_name !== '', basicFields.trainer_name);
      logTest('experience_level preenchido', !!basicFields.experience_level && basicFields.experience_level !== '', basicFields.experience_level);
    }
    
  } catch (e) {
    logTest('Dados de perfil são JSON válido', false, e.message);
  }
} else {
  console.log('%c⚠️ Nenhum dado de perfil salvo ainda. Execute um save primeiro.', styles.warning);
}

console.log('');

// ============================================
// TESTE 4: Verificar ProfileManager Global
// ============================================
console.log('%c📋 TESTE 4: Verificar ProfileManager Global', styles.section);

logTest('window.ProfileManager existe', typeof window.ProfileManager !== 'undefined');
logTest('window.profileData existe', typeof window.profileData !== 'undefined');

if (window.profileData) {
  const sections = Object.keys(window.profileData);
  console.log(`   Seções em profileData: ${sections.join(', ')}`);
  
  if (window.profileData.basic) {
    const basic = window.profileData.basic;
    console.log('   profileData.basic:', {
      full_name: basic.full_name,
      phone: basic.phone,
      location: basic.location,
      goals: basic.goals,
      trainer_name: basic.trainer_name,
      experience_level: basic.experience_level
    });
    
    // Verificar se dados estão carregados
    const hasData = basic.full_name || basic.phone || basic.location || (basic.goals && basic.goals.length > 0);
    logTest('profileData.basic contém dados', hasData, hasData ? 'Dados encontrados' : 'Vazio/padrão');
  } else {
    logTest('profileData.basic existe', false, 'Seção basic não encontrada');
  }
}

console.log('');

// ============================================
// TESTE 5: Verificar Sincronização
// ============================================
console.log('%c📋 TESTE 5: Verificar Sincronização (localStorage vs global)', styles.section);

if (profileData && window.profileData && window.profileData.basic) {
  const localData = JSON.parse(profileData);
  const globalData = window.profileData;
  
  if (localData.basic && globalData.basic) {
    const fields = ['full_name', 'phone', 'location', 'trainer_name', 'experience_level'];
    
    fields.forEach(field => {
      const localValue = localData.basic[field];
      const globalValue = globalData.basic[field];
      const match = localValue === globalValue;
      
      logTest(
        `Campo "${field}" sincronizado`, 
        match, 
        match ? 'OK' : `Local: "${localValue}" vs Global: "${globalValue}"`
      );
    });
    
    // Goals (array)
    const localGoals = JSON.stringify(localData.basic.goals || []);
    const globalGoals = JSON.stringify(globalData.basic.goals || []);
    logTest(
      'Campo "goals" sincronizado',
      localGoals === globalGoals,
      localGoals === globalGoals ? 'OK' : `Local: ${localGoals} vs Global: ${globalGoals}`
    );
  }
}

console.log('');

// ============================================
// TESTE 6: Verificar UI (Saved Profile Overview)
// ============================================
console.log('%c📋 TESTE 6: Verificar UI - Saved Profile Overview', styles.section);

const overviewElements = {
  fullName: document.querySelector('#display-full-name, [data-field="full_name"]'),
  phone: document.querySelector('#display-phone, [data-field="phone"]'),
  location: document.querySelector('#display-location, [data-field="location"]'),
  goals: document.querySelector('#display-goals, [data-field="goals"]'),
  trainer: document.querySelector('#display-trainer, [data-field="trainer_name"]'),
  experience: document.querySelector('#display-experience, [data-field="experience_level"]')
};

Object.entries(overviewElements).forEach(([name, element]) => {
  if (element) {
    const text = element.textContent.trim();
    const isEmpty = !text || text === 'Not provided' || text === 'None' || text === '';
    logTest(`UI mostra ${name}`, !isEmpty, `Valor: "${text}"`);
  } else {
    console.log(`%c⚠️ Elemento UI "${name}" não encontrado`, styles.warning);
  }
});

console.log('');

// ============================================
// RESUMO FINAL
// ============================================
console.log('%c' + '='.repeat(60), 'color: #F6C84E;');
console.log('%c📊 RESUMO DOS TESTES', styles.section);
console.log(`%c✅ Testes Passados: ${testsPassed}`, styles.success);
console.log(`%c❌ Testes Falhados: ${testsFailed}`, styles.error);
console.log(`%c📈 Taxa de Sucesso: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`, styles.info);
console.log('%c' + '='.repeat(60), 'color: #F6C84E;');

console.log('');

if (testsFailed === 0) {
  console.log('%c🎉 TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.', styles.success);
} else {
  console.log('%c⚠️ ALGUNS TESTES FALHARAM. Verifique os detalhes acima.', styles.warning);
  console.log('');
  console.log('%c💡 DICAS:', styles.info);
  console.log('   1. Se dados não existem no localStorage: Execute um SAVE primeiro');
  console.log('   2. Se dados existem mas não carregam: Problema no LOAD');
  console.log('   3. Se dados carregam mas UI não mostra: Problema no DISPLAY');
  console.log('   4. Recarregue a página (F5) e execute o teste novamente');
}

console.log('');
console.log('%c✅ Teste completo! Cole este output no chat.', styles.section);
