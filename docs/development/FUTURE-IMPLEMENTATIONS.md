# Website Roadmap — Ordem de Execução (Fácil → Difícil)

## ✅ Já implementado
- Navbar: melhorar o arredondamento da logo
- Pagamento Stripe
- Criação de usuário, login e senha
- Armazenar usuário e senha para login, Google login
- Mensagem de confirmação após contato
- Correção de erros de tradução: login/register
- ✅ **Sistema de reset de senha completo** (forgot-password.html + email workflow)
- ✅ **Sistema de verificação de email** (email-verification-guard.js + proteção de páginas)

## 🔜 Pendentes (Ordem sugerida)
1. Melhorar testimonials e acrescentar transformations (UX/UI)
2. Resolver erros de tradução no dashboard
3. Melhorar layout do pricing e opções de conversão de moeda no navbar/rodapé; corrigir quebra de página antes dos cards
4. Implementar “My Profile” (usuário pode ver e editar suas informações pessoais)
5. Armazenar informações completas do usuário (foto, email, telefone, birthday, etc.) após login
6. Upload de físico, peso, altura, medidas no “My Profile”
7. Usuários podem deixar review
8. Implementar descontos e preços para 3, 6 e 12 meses
9. Conversão de moedas no checkout (libra, euro, reais, etc.) — considerar preços diferentes por moeda
10. Preparar uma API estável para o futuro Garcia Builder Fitness App; avaliar My PT Hub apenas como integração temporária

## 💡 Opções Futuras
- Integrar conteúdo e treinos com o futuro Garcia Builder Fitness App
- Criar sistema de newsletter para e-mail
- Criar e-book gratuito
# 🚧 IMPLEMENTAÇÕES FUTURAS - Garcia Builder

## 📋 Próximas Melhorias e Correções

### 🔧 ALTA PRIORIDADE

#### 1. **Correção Admin Real Supabase**
**Status:** 🟡 Pendente
**Problema:** Admin `andregarcia.pt72@gmail.com` existe no banco mas login falha
**Causa:** Incompatibilidade na criptografia de senha entre inserção manual e validação Supabase
**Solução Proposta:**
- Usar API oficial do Supabase para criar admin
- Ou resetar senha via dashboard do Supabase
- Implementar método de sincronização de senhas

**Arquivos Relacionados:**
- `fix-admin-password.sql` - Script de correção preparado
- `insert-users-safe.sql` - Método atual funcionando para outros usuários

**Workaround Atual:** ✅ Super Admin Local (`admin@local`) funcionando 100%

---

### 🛡️ SEGURANÇA

#### 2. **✅ Validação de Email para Usuários Reais**
**Status:** ✅ IMPLEMENTADO
**Descrição:** Sistema de verificação de email obrigatório implementado com email-verification-guard.js
**Benefício:** Maior segurança e verificação de identidade
**Arquivos:** `js/email-verification-guard.js`, proteção adicionada ao dashboard, enhanced-dashboard e my-profile

#### 3. **✅ Sistema de Recuperação de Senha**
**Status:** ✅ IMPLEMENTADO
**Descrição:** Sistema completo de reset de senha via email implementado
**Arquivos:** `forgot-password.html`, `reset-password.html`, `test-password-reset.html`

---

### 🎨 UX/UI

#### 4. **Notificações Push**
**Status:** 🔵 Feature futura
**Descrição:** Sistema de notificações para updates e alertas

#### 5. **Dark/Light Mode Toggle**
**Status:** 🔵 Feature futura
**Descrição:** Alternar entre tema claro e escuro

#### 6. **✅ Dashboard Mobile Responsivo**
**Status:** ✅ IMPLEMENTADO
**Descrição:** Interface otimizada para dispositivos móveis com navegação responsiva
**Melhorias:**
- Enhanced-dashboard com toggle mobile e overlay
- Dashboard principal com layout responsivo
- My-profile otimizado para mobile
- Navbar adaptativo em todas as páginas
- Test page para validação (test-mobile-responsiveness.html)

---

### 📊 FUNCIONALIDADES

#### 7. **Sistema de Relatórios Avançados**
**Status:** 🔵 Feature futura
**Descrição:** Relatórios detalhados de progresso e estatísticas

#### 8. **Integração com Wearables**
**Status:** 🔵 Feature futura
**Descrição:** Conectar com dispositivos fitness (Apple Watch, Fitbit)

#### 9. **Sistema de Agendamento**
**Status:** 🔵 Feature futura
**Descrição:** Booking de sessões de treino

---

### 🔧 TÉCNICAS

#### 10. **Otimização de Performance**
**Status:** 🟡 Monitorar
**Descrição:**
- Lazy loading de componentes
- Otimização de imagens
- Cache de dados

#### 11. **Testes Automatizados**
**Status:** 🔵 Para implementar
**Descrição:** Suite de testes unitários e de integração

#### 12. **CI/CD Pipeline**
**Status:** 🔵 Para implementar
**Descrição:** Deploy automatizado via GitHub Actions

---

### 🌐 DEPLOY

#### 13. **Configuração de Domínio Personalizado**
**Status:** 🟡 Pendente
**Descrição:** Configurar domínio próprio e certificado SSL

#### 14. **CDN e Otimização**
**Status:** 🔵 Para implementar
**Descrição:** Usar CDN para assets estáticos

---

## 📈 ROADMAP

### **Fase 1 - Correções Críticas** (Próximas 2 semanas)
- [ ] Correção do admin real Supabase
- [x] Validação de email para novos usuários ✅ **IMPLEMENTADO**
- [ ] Testes completos de produção

### **Fase 2 - Melhorias UX** (1-2 meses)
- [x] Sistema de recuperação de senha ✅ **IMPLEMENTADO**
- [x] Sistema de verificação de email ✅ **IMPLEMENTADO**
- [x] Dashboard mobile otimizado ✅ **IMPLEMENTADO**
- [ ] Notificações básicas

### **Fase 3 - Features Avançadas** (3-6 meses)
- [ ] Sistema de relatórios
- [ ] Agendamento de sessões
- [ ] Integração com wearables

### **Fase 4 - Escala e Performance** (6+ meses)
- [ ] Testes automatizados
- [ ] CI/CD completo
- [ ] Arquitetura de microserviços

---

## 🏷️ TAGS

- `#admin-fix` - Correção do admin real
- `#security` - Melhorias de segurança
- `#ux` - Melhorias de experiência
- `#performance` - Otimizações
- `#features` - Novas funcionalidades
- `#deploy` - Deploy e produção

---

## 📝 NOTAS

**Última Atualização:** 1 de Outubro, 2025
**Status Atual:** ✅ Sistema Production Ready com admin local
**Próxima Revisão:** Após deploy em produção

**Desenvolvedor:** Andre Garcia
**Repositório:** https://github.com/andrejulio072/Garcia-Builder
