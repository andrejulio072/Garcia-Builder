# 🔐 Sistema de Autenticação - Garcia Builder

Sistema completo de autenticação implementado no projeto Garcia Builder com registro, login, proteção de conteúdo e interface multilíngue.

## ✨ Funcionalidades Implementadas

### 🔑 Autenticação Básica
- **Registro de usuários** com validação completa de formulário
- **Login/Logout** com opção "Lembrar de mim"
- **Validação em tempo real** (email, senha, confirmação de senha)
- **Indicador de força da senha** com feedback visual
- **Armazenamento local** usando localStorage (para demo/prototipagem)

### 🌐 Multilíngue
- **Suporte completo** para EN/PT/ES
- **Traduções integradas** ao sistema i18n existente
- **Interface responsiva** com design Garcia Builder

### 🛡️ Proteção de Conteúdo
- **AuthGuard** para proteção automática de páginas
- **Conteúdo restrito** usando atributo `data-auth-required`
- **Menu de usuário** dinâmico na navbar
- **Redirecionamento** automático após login/logout

### 🎨 Interface Moderna
- **Design consistente** com o tema Garcia Builder
- **Efeitos glass** e gradientes dourados
- **Animações suaves** e feedback visual
- **Totalmente responsivo** para mobile e desktop

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
```
login.html              # Página de login e registro
css/auth.css            # Estilos para autenticação
js/auth.js              # Lógica principal de autenticação
js/auth-guard.js        # Sistema de proteção de conteúdo
dashboard.html          # Exemplo de página protegida
```

### Arquivos Modificados
```
assets/i18n.js          # Traduções adicionadas
index.html              # Script auth-guard adicionado
about.html              # Script auth-guard adicionado
pricing.html            # Script auth-guard adicionado
contact.html            # Script auth-guard adicionado
testimonials.html       # Script auth-guard adicionado
faq.html                # Script auth-guard adicionado
transformations.html    # Script auth-guard adicionado
programs.html           # Script auth-guard adicionado
```

---

## 🚀 Como Usar

### 1. Acessar as Páginas de Autenticação

```
https://seudominio.com/login.html                    # Login
https://seudominio.com/login.html?action=register    # Registro
```

### 2. Proteger Conteúdo Específico

Use o atributo `data-auth-required` em qualquer elemento:

```html
<div class="pricing-premium" data-auth-required>
    <!-- Este conteúdo só aparece para usuários logados -->
    <h3>Plano Premium</h3>
    <p>Conteúdo exclusivo para membros...</p>
</div>
```

### 3. Proteger Páginas Inteiras

Adicione no início do script da página:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Redireciona para login se não autenticado
    if (!AuthSystem.isLoggedIn()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }
});
```

### 4. Verificar Status do Usuário

```javascript
// Verificar se usuário está logado
if (AuthSystem.isLoggedIn()) {
    console.log('Usuário logado');
}

// Obter dados do usuário atual
const user = AuthSystem.getCurrentUser();
if (user) {
    console.log('Nome:', user.name);
    console.log('Email:', user.email);
}

// Fazer logout
AuthSystem.logout();
```

---

## 🔧 Configuração e Personalização

### Configurar Redirecionamentos

Os usuários são automaticamente redirecionados após o login. Para personalizar:

```html
<!-- Redirecionar para página específica após login -->
<a href="login.html?redirect=/pricing.html">Login para ver preços</a>
```

### Personalizar Validações

No arquivo `js/auth.js`, você pode modificar as regras de validação:

```javascript
// Exemplo: alterar critérios de senha forte
calculatePasswordStrength(password) {
    let score = 0;
    const checks = {
        length: password.length >= 8,        // Mínimo 8 caracteres
        lowercase: /[a-z]/.test(password),   // Letra minúscula
        uppercase: /[A-Z]/.test(password),   // Letra maiúscula
        numbers: /\d/.test(password),        // Números
        special: /[!@#$%^&*()]/.test(password) // Caracteres especiais
    };

    // Sua lógica personalizada aqui...
}
```

### Adicionar Campos ao Registro

Para adicionar campos extras ao formulário de registro:

1. **Adicione o campo no HTML** (`login.html`):
```html
<div class="mb-3">
    <label for="registerPhone" class="form-label">Telefone</label>
    <input type="tel" class="form-control" id="registerPhone" placeholder="(11) 99999-9999">
</div>
```

2. **Capture o valor no JavaScript** (`js/auth.js`):
```javascript
// No método handleRegister
const phone = document.getElementById('registerPhone').value.trim();

// Adicione ao objeto newUser
const newUser = {
    id: this.generateId(),
    name,
    email: email.toLowerCase(),
    phone, // Campo adicional
    password,
    registeredAt: new Date().toISOString(),
    lastLogin: null
};
```

---

## 🎯 Exemplos de Uso

### Botões Condicionais

```html
<!-- Este botão muda dependendo do status de login -->
<div id="pricing-cta">
    <!-- Preenchido automaticamente pelo auth-guard -->
</div>
```

### Menu de Usuário Personalizado

O sistema automaticamente adiciona um menu de usuário à navbar:

```html
<!-- Para usuários logados -->
<div class="dropdown">
    <button class="btn btn-outline-light dropdown-toggle">
        <i class="fas fa-user-circle"></i> João
    </button>
    <ul class="dropdown-menu">
        <li><a href="profile.html">Meu Perfil</a></li>
        <li><a href="dashboard.html">Dashboard</a></li>
        <li><button onclick="AuthSystem.logout()">Sair</button></li>
    </ul>
</div>

<!-- Para visitantes -->
<div class="d-flex gap-2">
    <a href="login.html" class="btn btn-outline-light">Login</a>
    <a href="login.html?action=register" class="btn btn-primary">Cadastro</a>
</div>
```

### Proteção de Formulários

```html
<form action="https://formspree.io/f/XXXXX" method="POST">
    <!-- O auth-guard automaticamente intercepta formulários para usuários não logados -->
    <input type="email" name="email" required>
    <textarea name="message" required></textarea>
    <button type="submit">Enviar Mensagem</button>
</form>
```

---

## 📱 Interface Responsiva

O sistema é totalmente responsivo:

- **Mobile First**: Design otimizado para celular
- **Touch Friendly**: Botões e campos adequados para touch
- **Keyboard Navigation**: Suporte completo para teclado
- **Screen Readers**: HTML semântico para acessibilidade

---

## 🔄 Migração para Backend Real

Para usar com backend real, substitua as seguintes funções em `js/auth.js`:

```javascript
// Substitua este método
async handleLogin(e) {
    // Sua lógica atual com localStorage
}

// Por este (exemplo com fetch)
async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();

        // Salvar token JWT
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('gb_current_user', JSON.stringify(data.user));

        // Redirecionar
        window.location.href = 'dashboard.html';

    } catch (error) {
        this.showError(error.message);
    }
}
```

---

## 🛠️ Troubleshooting

### Problemas Comuns

**1. Usuário não consegue fazer login**
- Verifique se o email está correto (case-insensitive)
- Limpe o localStorage: `localStorage.clear()`
- Verifique o console para erros JavaScript

**2. Conteúdo protegido não aparece**
- Confirme que o atributo `data-auth-required` está correto
- Verifique se `auth-guard.js` está carregado
- Teste com `AuthSystem.isLoggedIn()` no console

**3. Traduções não funcionam**
- Confirme que `i18n.js` foi atualizado com as novas traduções
- Verifique se os atributos `data-i18n` estão corretos
- Teste mudança de idioma no console

### Debug no Console

```javascript
// Verificar usuários cadastrados
console.log(JSON.parse(localStorage.getItem('gb_users') || '[]'));

// Verificar usuário atual
console.log(AuthSystem.getCurrentUser());

// Verificar status de login
console.log(AuthSystem.isLoggedIn());

// Limpar todos os dados
localStorage.clear();
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE**: Esta implementação usa localStorage e é adequada apenas para:
- Prototipagem
- Demonstrações
- Desenvolvimento local

Para produção, implemente:
- **Autenticação JWT** com backend
- **Hash de senhas** (bcrypt, scrypt)
- **HTTPS obrigatório**
- **Rate limiting** para tentativas de login
- **Validação server-side**
- **Sanitização de dados**

---

## 📞 Suporte

Se encontrar problemas ou precisar de ajuda:

1. **Verifique este README** para soluções comuns
2. **Teste no console** usando os comandos de debug
3. **Examine o código** em `js/auth.js` e `js/auth-guard.js`
4. **Entre em contato** via WhatsApp ou Instagram

---

**🎉 Sistema implementado com sucesso! Agora você tem autenticação completa no Garcia Builder.**
