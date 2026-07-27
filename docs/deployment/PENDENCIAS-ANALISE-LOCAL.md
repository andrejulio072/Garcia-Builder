# Pendencias para analise e validacao local

Data: 2026-07-27
Branch analisada: codex/paid-assessment-landing-page

## Objetivo
Checklist operacional para finalizar a analise local e preparar validacao de lancamento do fluxo `/assessment`.

## Resultado da analise local (executado agora)

1. `npm test`: FALHOU
- Erro: link interno quebrado para regra de preview estatico.
- Arquivo: `cookie-policy.html`
- Detalhe: `href="/terms"` deve apontar para caminho direto com `.html`.

2. `npm run build`: OK
- `build:env` executou e gerou `env-config.json`.
- `build:public` executou e gerou pasta `public`.

3. `npm run test:starter-assessment:smoke`: FALHOU
- Erro: `SUPABASE_URL is required`.

## Passos pendentes (ordem recomendada)

1. Corrigir link estatico no arquivo `cookie-policy.html`
- Trocar `href="/terms"` por `href="/terms.html"`.

2. Reexecutar suite de testes
- Comando: `npm test`
- Criterio de aceite: todos os checks com status `passed`.

3. Configurar variaveis para smoke test do assessment
- Obrigatoria detectada: `SUPABASE_URL`
- Recomendadas para fluxo completo: `SUPABASE_SERVICE_ROLE_KEY` (ou `SUPABASE_SECRET_KEY`) e `STARTER_ASSESSMENT_TEST_EMAIL`.

4. Reexecutar smoke do assessment
- Comando: `npm run test:starter-assessment:smoke`
- Criterio de aceite: retorno JSON com `ok: true`.

5. Higienizar arquivo de ambiente gerado
- O build alterou `env-config.json` no workspace.
- Antes de commit, confirmar se a alteracao deve ser versionada.

6. Validacao final minima antes de integracao
- `npm test`
- `npm run build`
- `npm run test:starter-assessment:smoke`
- `git status --short` sem ruido acidental.

## Evidencias capturadas

- `npm test`:
  - `AssertionError`: Broken internal links found.
  - `cookie-policy.html: href="/terms" should use a direct .html path for static previews`.

- `npm run build`:
  - `[env-config] Generated env-config.json`
  - `[public-build] Generated public`

- `npm run test:starter-assessment:smoke`:
  - `{ "ok": false, "message": "SUPABASE_URL is required" }`
