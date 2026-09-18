# Garcia Builder Fitness App para Android
## Checklist exclusivo de migração do Manus para Codex

**Data:** 18 de setembro de 2026  
**Repositório verificado:** `andrejulio072/Garcia-Builder`  
**Commit verificado:** `90207d7`  
**Escopo:** somente o aplicativo Android Garcia Builder Fitness e os serviços necessários para que ele funcione.  
**Fora do escopo:** migração completa do website público, versão iOS, redesign do produto e troca de provedores que não sejam necessários para o Android.

---

## 0. Resultado da verificação do GitHub

A primeira etapa é registrar uma conclusão importante: o repositório `andrejulio072/Garcia-Builder` **não é o código do aplicativo Android**.

Ele contém um website estático/serverless com HTML, CSS, JavaScript, Vercel, Supabase, Stripe, automações e documentação. A árvore do GitHub não contém `android/`, `app.json`, `app.config.js`, `eas.json`, `AndroidManifest.xml`, `build.gradle`, `settings.gradle` nem outro manifesto de aplicativo Expo/React Native.

O commit `90207d7` contém o documento amplo de migração criado anteriormente. Esse documento mistura website e aplicativo. Este checklist substitui esse escopo por um plano exclusivamente Android.

**Conclusão operacional:** não é possível concluir a migração do app Android a partir deste repositório sozinho. Primeiro é necessário localizar o projeto Android no Manus, em outro repositório, no Expo/EAS ou em um backup Task Data.

- [ ] Confirmar o nome exato do app no Google Play.
- [ ] Confirmar se o app foi construído com Expo/React Native, React Native CLI, Flutter, Android nativo ou outra tecnologia.
- [ ] Confirmar o package name Android, por exemplo `com.garciabuilder.fitness`.
- [ ] Localizar a tarefa/projeto do app no Manus.
- [ ] Localizar o projeto EAS/Expo, se existir.
- [ ] Localizar o repositório Git correto, se o código já tiver sido exportado.
- [ ] Confirmar qual backend o app usa: Manus, Supabase, API própria ou combinação.
- [ ] Não iniciar um novo app nem criar um novo package name antes de confirmar a identidade do app publicado.

---

## 1. O que precisa ser migrado

A migração do Android tem cinco partes diferentes. Todas precisam ser preservadas para que os usuários atuais continuem usando o app e recebendo atualizações.

| Parte | O que deve ser preservado | Onde normalmente está |
|---|---|---|
| Código Android | Código-fonte, assets, configuração, dependências e histórico | Manus Task Data, GitHub ou outro repositório |
| Backend | APIs, autenticação, banco, storage, uploads e jobs | Manus, Supabase ou provedor externo |
| Identidade do app | Package name, application ID, projeto Expo/EAS e URL de update | `app.json`, `app.config.*`, `eas.json`, Expo/EAS |
| Assinatura | Keystore, alias, senha, upload key e configuração Google Play App Signing | EAS, Google Play Console e cofre de segredos |
| Distribuição | Listing, pacote publicado, tracks, testers, builds e serviço da conta | Google Play Console |

Um APK instalado no aparelho não substitui o código-fonte, o backend ou a chave de assinatura. Um backup de código também não substitui os dados dos usuários nem os objetos enviados ao storage.

---

## 2. Exportar o projeto Android do Manus

### 2.1 Identificar a conta e a tarefa correta

- [ ] Verificar a notificação e o e-mail do Manus para saber se a conta pessoal ou a conta de equipe foi afetada.
- [ ] Verificar cada workspace separadamente.
- [ ] Fazer o backup de equipe usando a conta do proprietário da equipe.
- [ ] Listar todas as tarefas associadas ao Garcia Builder Fitness App.
- [ ] Registrar nome da tarefa, ID da tarefa, ID do projeto, workspace, data da última atualização e status de publicação.
- [ ] Confirmar se o backend do app está na mesma tarefa ou em uma tarefa separada.
- [ ] Confirmar se existem tarefas separadas para banco, API, notificações, pagamentos ou painel administrativo.

### 2.2 Fazer o Task Data Backup

No backup do Manus, exportar a tarefa do app com **All time**. Para um backup mais amplo, usar **Export task data → Export more → All tasks → All time → Start export**. Em um export customizado, incluir explicitamente a tarefa do aplicativo; não presumir que uma categoria de website inclua o app Android.

- [ ] Criar o Account Info Backup antes do Task Data Backup se a conta for Type C.
- [ ] Exportar a tarefa do app Android.
- [ ] Exportar todas as tarefas de backend relacionadas.
- [ ] Exportar tarefas de banco, arquivos, automações e integrações relacionadas.
- [ ] Manter todos os arquivos divididos de cada export exatamente como foram produzidos.
- [ ] Não renomear, editar, recomprimir ou misturar partes de exportações diferentes.
- [ ] Guardar cópia em armazenamento local criptografado.
- [ ] Guardar segunda cópia em armazenamento cloud criptografado.
- [ ] Gerar SHA-256 para cada pacote e guardar os checksums.
- [ ] Fazer um export final depois da última atividade de usuário que precise ser preservada.

O Task Data Backup é um snapshot. Ele não sincroniza alterações posteriores. Registros, mensagens, treinos, pedidos, uploads e configurações criados depois do export não entram automaticamente no pacote antigo.

### 2.3 Salvar arquivos de build

O backup não deve ser tratado como garantia de que todos os artefatos compilados antigos estarão disponíveis.

- [ ] Baixar o APK de produção atual.
- [ ] Baixar o AAB usado no Google Play, se houver acesso ao arquivo.
- [ ] Baixar APKs de teste, staging e distribuição interna que ainda sejam necessários.
- [ ] Guardar os arquivos com versão, data, commit e SHA-256.
- [ ] Guardar os arquivos fora do repositório público.
- [ ] Registrar qual certificado assinou cada artefato.
- [ ] Confirmar se o APK instalado atualmente chama o backend Manus ou um backend externo.

### 2.4 Exportar dados que estejam fora do Manus

Cloud Computer e outros ambientes auxiliares não são automaticamente cobertos pelo backup do projeto.

- [ ] Copiar arquivos do Cloud Computer usados somente pelo app.
- [ ] Copiar bancos locais, scripts, certificados e arquivos de configuração.
- [ ] Copiar arquivos que estejam em Google Drive, Dropbox, S3, Supabase Storage ou outro storage.
- [ ] Exportar planilhas, catálogos de exercícios, imagens, vídeos e PDFs usados pelo app.
- [ ] Registrar o proprietário de cada conta externa.

---

## 3. Colocar o código correto no GitHub para o Codex

Não colocar o código Android dentro do diretório do website sem confirmar a arquitetura. Criar uma estrutura clara, por exemplo:

```text
Garcia-Builder-Fitness-Android/
├── app.json ou app.config.ts
├── eas.json                 # se for Expo/EAS
├── package.json
├── src/
├── assets/
├── android/                 # somente se houver projeto nativo gerado ou mantido
├── supabase/                # somente se fizer parte do app
├── api/                     # somente se o backend estiver neste repositório
└── README.md
```

- [ ] Confirmar qual conta GitHub deve ser proprietária do código Android.
- [ ] Criar repositório privado se o app contiver código, configurações ou dados não públicos.
- [ ] Fazer commit do código-fonte e dos assets, mas não dos segredos.
- [ ] Não fazer commit de keystore, `credentials.json`, tokens, arquivos `.env`, service-account JSON ou chaves privadas.
- [ ] Adicionar `.gitignore` para Android, Expo, EAS, Gradle, keystores e arquivos locais.
- [ ] Adicionar `.env.example` somente com nomes de variáveis.
- [ ] Adicionar README com instruções de instalação e build.
- [ ] Registrar o commit correspondente ao APK/AAB de produção atual.
- [ ] Configurar branch `main` protegida e uma branch de staging.
- [ ] Configurar secret scanning e push protection.
- [ ] Configurar CI para instalar dependências e executar testes sem acessar produção.
- [ ] Confirmar que o Codex está apontando para o repositório Android correto, e não para o website `Garcia-Builder`.

---

## 4. Identificar a tecnologia do app

### Se for Expo/React Native

- [ ] Confirmar presença de `app.json`, `app.config.js` ou `app.config.ts`.
- [ ] Confirmar presença de `eas.json`.
- [ ] Registrar `owner`, `slug`, `projectId`, `version`, `runtimeVersion`, `updates.url` e `extra`.
- [ ] Registrar `android.package`.
- [ ] Registrar perfis `development`, `preview` e `production`.
- [ ] Registrar canais, branches e histórico do EAS Update.
- [ ] Registrar variáveis de ambiente do EAS para cada ambiente.
- [ ] Transferir o projeto EAS para a organização correta ou preservar o owner atual.

### Se for React Native CLI

- [ ] Preservar `android/`, `gradle.properties`, `build.gradle`, `settings.gradle` e `AndroidManifest.xml`.
- [ ] Preservar `applicationId`, `versionCode`, flavors e build types.
- [ ] Preservar configurações de ProGuard/R8.
- [ ] Preservar `google-services.json` somente em secret storage quando aplicável.
- [ ] Recriar o ambiente Java, Android SDK, Gradle e Node na versão compatível.

### Se for Android nativo

- [ ] Preservar o projeto Android Studio completo.
- [ ] Registrar versão do Android Gradle Plugin, Gradle, Kotlin e compile SDK.
- [ ] Registrar módulos, flavors, build types e dependências Maven.
- [ ] Preservar arquivos XML de recursos, manifest, deep links e permissões.
- [ ] Recriar o build em uma máquina limpa antes de publicar qualquer atualização.

### Se a tecnologia ainda for desconhecida

- [ ] Não assumir Expo.
- [ ] Abrir o Task Data Backup e localizar os arquivos de build e manifesto.
- [ ] Examinar `package.json`, `pubspec.yaml`, `build.gradle`, `settings.gradle` e `app.json`.
- [ ] Identificar o comando que gerava o artefato atualmente publicado.
- [ ] Registrar a tecnologia no README antes de iniciar alterações.

---

## 5. Preservar a identidade do app Android

Estes valores precisam continuar iguais para que o Google Play reconheça a atualização como pertencente ao app existente.

- [ ] Package name / application ID.
- [ ] Nome do app e nome curto.
- [ ] Ícone, adaptive icon e splash screen.
- [ ] `versionCode` atual e próximo número disponível.
- [ ] `versionName` atual.
- [ ] Deep-link schemes.
- [ ] App Links e domínio associado.
- [ ] Firebase project ID, se usado.
- [ ] Expo project ID, se usado.
- [ ] EAS Update URL, channel e runtime version, se usado.
- [ ] IDs de anúncios ou push notification app, se usados.

Não criar um novo package name para “testar” uma atualização de produção. Para testes, usar um application ID de staging separado apenas quando a configuração já suportar isso.

---

## 6. Android signing e Google Play Console

### 6.1 Registrar a situação atual

- [ ] Confirmar a conta proprietária do Google Play Console.
- [ ] Confirmar o package name no Google Play Console.
- [ ] Confirmar se o Google Play App Signing está ativado.
- [ ] Registrar o SHA-1 e SHA-256 do certificado de app signing.
- [ ] Registrar o SHA-1 e SHA-256 do upload certificate.
- [ ] Registrar o alias da keystore.
- [ ] Registrar a data e o responsável pela criação da chave.
- [ ] Registrar tracks: internal, closed, open e production.
- [ ] Registrar testers, grupos, países, staged rollout e pausas.
- [ ] Registrar content rating, Data Safety, target audience e permissões declaradas.
- [ ] Registrar a URL de privacy policy e a página de suporte.

### 6.2 Preservar a chave

- [ ] Baixar a credencial Android do EAS, se o projeto usar EAS.
- [ ] Guardar keystore, alias e senhas em um password manager ou secret manager.
- [ ] Não colocar keystore no GitHub.
- [ ] Não enviar keystore por e-mail ou chat.
- [ ] Confirmar se a chave disponível é a upload key ou a app signing key.
- [ ] Não gerar uma nova chave antes de confirmar o modelo de assinatura do Google Play.
- [ ] Se a upload key foi perdida, seguir o processo oficial de reset do upload certificate no Google Play.
- [ ] Testar a assinatura de um AAB em uma máquina limpa.

A chave de app signing do Google Play e a upload key têm funções diferentes. Perder a upload key pode ser recuperável por reset no Google Play; perder a chave de app signing gerenciada fora do Google Play pode ser uma situação muito mais grave.

### 6.3 Recriar acesso e automação

- [ ] Criar ou transferir a organização Expo/EAS correta.
- [ ] Criar service account do Google Play somente se o pipeline automatizado exigir.
- [ ] Guardar o JSON do service account fora do Git.
- [ ] Configurar permissões mínimas para build e submit.
- [ ] Recriar secrets no Codex CI ou no EAS.
- [ ] Fazer build interno antes de usar a track de produção.
- [ ] Fazer upload de um AAB assinado para uma track de teste.
- [ ] Confirmar que o Google Play aceita a assinatura e o package name.

---

## 7. Expo/EAS, se o app for Expo

O repositório verificado não contém configuração Expo. Esta seção só se aplica se o app Android real for encontrado no Manus ou em outro repositório.

- [ ] Registrar Expo account e organização proprietária.
- [ ] Registrar `owner`, `slug` e `projectId`.
- [ ] Transferir o projeto EAS para a conta correta quando a identidade precisar ser mantida.
- [ ] Confirmar que o projeto transferido mantém builds, updates e configuração necessários.
- [ ] Exportar variáveis EAS de development, preview e production.
- [ ] Recriar `eas.json`.
- [ ] Recriar profiles e channels.
- [ ] Recriar `runtimeVersion` e política de updates.
- [ ] Recriar Android credentials no owner correto.
- [ ] Executar `eas credentials` e confirmar a credencial Android.
- [ ] Executar um `eas build --platform android --profile preview`.
- [ ] Instalar o APK de preview em aparelho físico.
- [ ] Executar um build production sem publicar ainda.
- [ ] Confirmar que OTA updates não apontam para um projeto EAS antigo.
- [ ] Registrar o token de acesso EAS em secret storage, nunca no Git.

Comandos de referência, depois de confirmar que o projeto correto está no diretório:

```bash
npm ci
npx expo doctor
eas whoami
eas project:info
eas credentials
eas build --platform android --profile preview
eas build --platform android --profile production
```

Não executar builds de produção até confirmar package name, credenciais e backend.

---

## 8. Backend e dados usados pelo app Android

O app só estará migrado quando o backend atual estiver disponível com os mesmos contratos ou quando o app tiver sido atualizado para o novo endpoint.

### 8.1 Descobrir o backend real

- [ ] Procurar no código as URLs base de API.
- [ ] Procurar hosts `manus.space`, Supabase, Vercel, Firebase, AWS, Render, Railway ou outros.
- [ ] Registrar endpoints de login, perfil, treinos, planos, uploads, pagamentos, notificações e analytics.
- [ ] Registrar headers, tokens, versionamento e formato de erros.
- [ ] Confirmar se o app chama diretamente Supabase.
- [ ] Confirmar se o app depende de uma API serverless do website.
- [ ] Confirmar se existe um backend Manus que precisa ser restaurado.
- [ ] Confirmar se o app e o website compartilham projeto Supabase ou usam projetos diferentes.

### 8.2 Se o backend for Supabase

- [ ] Exportar roles, schema, data e migration history.
- [ ] Exportar `auth.users` e identities preservando UUIDs.
- [ ] Exportar buckets e todos os objetos do Storage.
- [ ] Exportar RLS, funções, triggers, índices e publicações.
- [ ] Preservar tabelas de usuário, perfil, preferências, treinos, planos, métricas, nutrição, progresso e notificações.
- [ ] Migrar push tokens, se armazenados no banco.
- [ ] Restaurar em projeto staging.
- [ ] Comparar contagens de usuários e registros.
- [ ] Testar RLS com usuário A e usuário B.
- [ ] Atualizar a URL e as chaves públicas no app.
- [ ] Nunca colocar `service_role` ou `SUPABASE_SECRET_KEY` dentro do APK.

### 8.3 Se o backend for Manus

- [ ] Incluir a tarefa de backend no Task Data Backup.
- [ ] Incluir banco, uploads, secrets, funções, jobs e configurações.
- [ ] Registrar o endereço do backend e todas as rotas usadas pelo APK existente.
- [ ] Restaurar o projeto antes de alterar o app publicado.
- [ ] Testar o APK antigo contra o backend restaurado.
- [ ] Se o backend for substituído, implementar compatibilidade de rotas ou publicar uma nova versão do app.

### 8.4 Se o backend for externo

- [ ] Exportar o banco do provedor externo.
- [ ] Exportar storage e CDN.
- [ ] Exportar secrets e configurações de deploy.
- [ ] Exportar certificados TLS e domínios, quando aplicável.
- [ ] Recriar staging e produção.
- [ ] Testar as mesmas respostas que o APK atual espera.

---

## 9. Usuários, autenticação e sessões

- [ ] Listar métodos de login: email/senha, Google, Facebook, magic link ou outro.
- [ ] Preservar UUIDs dos usuários.
- [ ] Preservar estado de confirmação de email.
- [ ] Preservar identities e provider IDs.
- [ ] Preservar metadados de perfil necessários ao app.
- [ ] Decidir se o JWT secret será preservado ou trocado.
- [ ] Planejar logout/relogin se o JWT secret mudar.
- [ ] Recriar redirect URIs Android.
- [ ] Recriar custom URL schemes e App Links.
- [ ] Recriar SHA-1/SHA-256 no Google Cloud/Firebase para OAuth Android.
- [ ] Testar login de usuário existente.
- [ ] Testar criação de usuário novo.
- [ ] Testar refresh token após fechar e reabrir o app.
- [ ] Testar logout e troca de usuário.
- [ ] Testar recuperação de senha em aparelho físico.

Não exportar nem armazenar senhas em texto claro. Se a migração não preservar os hashes de senha, preparar um fluxo de redefinição de senha.

---

## 10. Resend e email do aplicativo Android

Resend não aparece como integração confirmada no repositório `Garcia-Builder`. O código atual do website usa Brevo. Esta seção deve ser executada somente se o app Android realmente usar email transacional via Resend ou se houver decisão explícita de trocar o provedor.

- [ ] Confirmar se o app envia email diretamente ou se o backend envia.
- [ ] Confirmar que nenhuma `RESEND_API_KEY` está embutida no APK.
- [ ] Criar a conta Resend pertencente à empresa.
- [ ] Adicionar um subdomínio de envio, por exemplo `notifications.garciabuilder.fitness`.
- [ ] Adicionar exatamente os registros DNS DKIM e SPF fornecidos pelo Resend.
- [ ] Criar ou revisar o registro DMARC sem apagar políticas de outros remetentes.
- [ ] Verificar o domínio.
- [ ] Criar uma API key com privilégio mínimo.
- [ ] Configurar a API key apenas no backend ou Vercel/EAS server environment.
- [ ] Migrar templates de confirmação, recuperação, convite, assessment, recibo e notificações.
- [ ] Preservar idioma, remetente, reply-to e links.
- [ ] Migrar supressões, bounces, complaints e unsubscribes.
- [ ] Testar emails em endereços controlados.
- [ ] Confirmar que o app só chama o backend e nunca Resend diretamente.

Se o app atualmente depende de Brevo, não remover Brevo até que a implementação Resend esteja testada e o backend tenha sido implantado.

---

## 11. Push notifications

- [ ] Confirmar se o app usa Firebase Cloud Messaging, Expo Notifications ou outro serviço.
- [ ] Exportar projeto Firebase relacionado.
- [ ] Exportar `google-services.json` para uso seguro no build; não publicar no Git se a política da equipe exigir segredo.
- [ ] Registrar Firebase project ID e sender ID.
- [ ] Registrar service account usado pelo backend.
- [ ] Exportar tabela de push tokens.
- [ ] Confirmar permissões Android e notification channels.
- [ ] Confirmar deep links acionados ao tocar na notificação.
- [ ] Testar token novo após instalação limpa.
- [ ] Testar token após atualização do app.
- [ ] Testar logout para impedir notificação no usuário errado.
- [ ] Testar envio para um usuário individual e para um grupo controlado.
- [ ] Revogar credenciais antigas depois do cutover.

---

## 12. Conteúdo, arquivos e mídia

- [ ] Listar imagens de perfil, fotos, vídeos, PDFs, planos e thumbnails.
- [ ] Registrar bucket, path, owner e permissões de cada arquivo.
- [ ] Baixar objetos com checksum.
- [ ] Recriar buckets e políticas.
- [ ] Preservar nomes e paths quando o app já os referencia.
- [ ] Preservar URLs ou criar camada de compatibilidade.
- [ ] Testar upload, download, preview, cache e deleção.
- [ ] Testar arquivos grandes em redes móveis lentas.
- [ ] Confirmar que arquivos privados não ficam publicamente acessíveis.

---

## 13. Pagamentos e assinaturas no Android

Só executar esta seção se o app tiver pagamentos.

- [ ] Confirmar se o pagamento usa Google Play Billing, Stripe Checkout, Payment Links ou outro método.
- [ ] Registrar package name e vínculo da conta Google Play Billing.
- [ ] Exportar produtos, preços, ofertas, planos, assinaturas e IDs.
- [ ] Exportar mapeamento entre usuário, customer ID, subscription ID e entitlement.
- [ ] Registrar webhook endpoint e eventos.
- [ ] Configurar secrets somente no backend.
- [ ] Testar compra em licença/test track.
- [ ] Testar renovação, cancelamento, grace period, refund e restore purchases.
- [ ] Garantir idempotência no processamento de notificações.
- [ ] Não criar produtos duplicados sem um plano de mapeamento.
- [ ] Confirmar Data Safety e política de pagamentos no Google Play Console.

---

## 14. Codex: ambiente de desenvolvimento e CI Android

- [ ] Configurar Node na versão exigida pelo projeto.
- [ ] Configurar Java/JDK compatível.
- [ ] Configurar Android SDK, platform tools, build tools e emulator.
- [ ] Configurar Gradle conforme o projeto.
- [ ] Configurar `ANDROID_HOME` somente no ambiente local/CI.
- [ ] Instalar dependências com lockfile.
- [ ] Executar lint, testes unitários e testes de navegação.
- [ ] Executar build debug.
- [ ] Executar build release assinado em CI protegido.
- [ ] Fazer upload de artefatos de build para armazenamento privado.
- [ ] Não imprimir secrets nos logs.
- [ ] Não permitir que pull requests acessem secrets de produção.
- [ ] Separar backend staging de backend production.
- [ ] Gerar release notes por versão.
- [ ] Guardar associação entre commit, versionName, versionCode e AAB.

### Validações mínimas

```bash
npm ci
# Use os comandos específicos depois de identificar a tecnologia:
npm test
# Expo, se aplicável:
npx expo doctor
eas build --platform android --profile preview
```

O comando de build precisa ser confirmado no projeto Android real. Não usar os comandos do website `Garcia-Builder` como prova de que o app Android funciona.

---

## 15. Testes em aparelho físico

- [ ] Instalar o APK de staging em um aparelho Android limpo.
- [ ] Testar Android versão mínima suportada.
- [ ] Testar a versão Android mais recente suportada.
- [ ] Testar Wi-Fi e rede móvel.
- [ ] Testar rede lenta e perda de conexão.
- [ ] Testar rotação e retorno do background.
- [ ] Testar login, logout e refresh.
- [ ] Testar perfil e preferências.
- [ ] Testar treinos, planos, progresso e histórico.
- [ ] Testar imagens, vídeos, PDFs e uploads.
- [ ] Testar push notification e deep link.
- [ ] Testar compra/restauração, se aplicável.
- [ ] Testar atualização por cima da versão atualmente publicada.
- [ ] Testar migração de banco sem perda de dados.
- [ ] Testar comportamento quando o backend retorna 401, 403, 404, 429 e 5xx.
- [ ] Confirmar que o app mostra erro útil em vez de tela vazia.

---

## 16. Google Play: publicação da primeira build sob o novo processo

- [ ] Confirmar acesso de administrador ou release manager à conta Play Console.
- [ ] Confirmar que o package name do AAB é idêntico ao app existente.
- [ ] Confirmar que a assinatura é aceita pelo Google Play.
- [ ] Criar uma release em Internal testing.
- [ ] Instalar pelo link de teste.
- [ ] Verificar login e backend na build distribuída pela Play Store.
- [ ] Promover para Closed testing.
- [ ] Comparar crash rate e ANR com a versão anterior.
- [ ] Verificar Play Console pre-launch report.
- [ ] Revisar Data Safety, permissões, conteúdo e privacy policy.
- [ ] Configurar staged rollout.
- [ ] Publicar production somente após o período de observação.
- [ ] Guardar número da release, versionCode, AAB e commit.

---

## 17. Cutover e rollback do app Android

### Cutover

- [ ] Congelar alterações no app antigo.
- [ ] Fazer export final Manus.
- [ ] Fazer export final do backend e storage.
- [ ] Criar tag Git do código migrado.
- [ ] Criar build preview.
- [ ] Validar backend staging.
- [ ] Validar assinatura.
- [ ] Validar login e dados existentes.
- [ ] Validar push e uploads.
- [ ] Publicar Internal testing.
- [ ] Publicar Closed testing.
- [ ] Monitorar erros.
- [ ] Fazer rollout gradual em produção.

### Rollback

- [ ] Manter a versão anterior do Google Play pronta para rollout.
- [ ] Não revogar a chave antiga antes de confirmar a nova build.
- [ ] Manter o backend compatível com a versão antiga durante o rollout.
- [ ] Evitar migrations irreversíveis antes de a nova versão estar estável.
- [ ] Monitorar crash, ANR, login, API errors, pagamentos e notificações.
- [ ] Definir limite de erro que interrompe o rollout.
- [ ] Definir responsável por pausar rollout e restaurar backend.
- [ ] Registrar como reconciliar dados criados pela nova e pela antiga versão.

---

## 18. Segurança e proteção de dados

- [ ] Tratar perfil, métricas corporais, nutrição, saúde, progresso e pagamentos como dados sensíveis.
- [ ] Nunca incluir chave de serviço, chave privada, Resend key, Stripe secret ou database password no APK.
- [ ] Verificar o APK descompactado para detectar secrets acidentalmente empacotados.
- [ ] Rotacionar credenciais que tenham aparecido em logs, backups ou repositórios.
- [ ] Configurar RLS e autorização no backend.
- [ ] Confirmar que o usuário só acessa seus próprios dados.
- [ ] Confirmar processo de exportação e exclusão de conta.
- [ ] Atualizar privacy policy e Data Safety do Google Play.
- [ ] Definir retenção e destruição dos dumps de migração.
- [ ] Restringir acesso ao backup Manus, banco, storage e signing credentials.
- [ ] Manter registro de quem aprovou a migração.

---

## 19. Checklist de conclusão

| Item | Evidência | Status |
|---|---|---|
| Projeto Android correto localizado | Task ID, repo ou EAS project ID | [ ] |
| Tecnologia identificada | Expo, React Native, nativo ou outra | [ ] |
| Código migrado para repositório Android correto | URL e commit | [ ] |
| Task Data Backup preservado | Pacotes e checksums | [ ] |
| APK/AAB de produção arquivado | Arquivo e SHA-256 | [ ] |
| Package name confirmado | Google Play Console | [ ] |
| Keystore/upload key preservada | Cofre de segredos | [ ] |
| Google Play App Signing confirmado | Console e certificados | [ ] |
| EAS transferido, se aplicável | Project ID e owner | [ ] |
| Backend identificado | URL, contrato e owner | [ ] |
| Banco restaurado | Contagens e integridade | [ ] |
| Auth preservado | Login de usuário existente | [ ] |
| Storage restaurado | Contagem e testes de arquivo | [ ] |
| Resend configurado, se aplicável | Domínio, DNS e delivery | [ ] |
| Push notifications verificadas | Token e mensagem de teste | [ ] |
| Pagamentos verificados, se aplicável | Compra e restore | [ ] |
| Build preview funcionando | APK testado | [ ] |
| Build production assinada | AAB aceito pela Play | [ ] |
| Internal/Closed testing aprovado | Link e relatório | [ ] |
| Rollout monitorado | Crash/ANR/API metrics | [ ] |
| Rollback preparado | Versão anterior e plano | [ ] |
| Codex apontando para o projeto Android | Configuração verificada | [ ] |

---

## 20. Próximo passo obrigatório

Antes de qualquer novo commit de código, localizar o projeto Android real e fornecer estes identificadores:

1. URL ou nome do projeto/tarefa Manus do app.
2. Package name Android.
3. Expo owner/slug/project ID, se for Expo.
4. URL do repositório Android, se já existir.
5. URL/base URL do backend.
6. Nome da conta Google Play proprietária do app.

Sem esses seis itens, o repositório atual só pode ser tratado como o website Garcia Builder, não como o Garcia Builder Fitness App para Android.

---

## Referências

[1]: https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data "Guia oficial de backup do Manus"

[2]: https://help.manus.im/en/articles/16147895-service-change-overview-how-to-restore-your-data "Guia oficial de restauração do Manus"

[3]: https://docs.expo.dev/distribution/app-transfers/ "Transferência de projetos e apps Expo"

[4]: https://docs.expo.dev/app-signing/app-credentials/ "Credenciais de assinatura do Expo/EAS"

[5]: https://docs.expo.dev/eas/environment-variables/ "Variáveis de ambiente no EAS"

[6]: https://support.google.com/googleplay/android-developer/answer/9842756 "Google Play App Signing"

[7]: https://developer.android.com/studio/publish/app-signing "Assinatura de apps Android"

[8]: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore "Backup e restauração de banco no Supabase"

[9]: https://supabase.com/docs/guides/troubleshooting/migrating-auth-users-between-projects "Migração de usuários Auth entre projetos Supabase"

[10]: https://resend.com/docs/add-a-domain "Configuração de domínio de envio no Resend"

[11]: https://resend.com/docs/dashboard/api-keys/introduction "Chaves de API do Resend"

[12]: https://github.com/andrejulio072/Garcia-Builder "Repositório GitHub verificado Garcia-Builder"

---

**Preparado por:** Manus AI  
**Advertência:** este documento não afirma que o app Android já esteja no GitHub. A verificação encontrou somente o website; o projeto Android precisa ser localizado e anexado à migração.
