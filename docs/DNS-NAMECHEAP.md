# Configurar DNS no Namecheap (Render)

Este guia mostra como apontar seus domínios para o Render usando o painel do Namecheap. Funciona para ambos os domínios:

- garciabuilder.fitness
- garciabuilder.uk

> Observação: o Namecheap não suporta CNAME no domínio raiz (apex). Para o raiz usamos registros A (IPs) fornecidos pelo Render. Para `www` usamos CNAME apontando para o endereço `.onrender.com` do seu serviço Render.

## Pré‑requisitos

1) No Render, abra: Serviço → Settings → Custom Domains → Add Domain e adicione os quatro domínios:
   - `garciabuilder.fitness`
   - `www.garciabuilder.fitness`
   - `garciabuilder.uk`
   - `www.garciabuilder.uk`

2) Para cada domínio, o Render exibirá instruções DNS. Anote:
   - Para o domínio raiz (apex): 1 ou mais endereços IPv4 (A records) e, às vezes, IPv6 (AAAA). Ex.: `A @ -> <IP do Render>`
   - Para `www`: um destino CNAME. Ex.: `CNAME www -> garcia-builder.onrender.com`

> Use exatamente os valores mostrados no Render. Não invente IPs.

## Passo a passo no Namecheap

Repita os passos abaixo para cada domínio (fitness e uk).

1) Acesse Namecheap → Domain List → em seu domínio, clique em `Manage`.
2) Vá para a aba `Advanced DNS`.
3) Garanta que os Nameservers estão como `Namecheap BasicDNS` (em `Domain → Nameservers`). Caso use Cloudflare ou outro, faça a configuração no provedor correspondente.
4) Em `Host Records`, crie/edite os seguintes registros:

- Domínio raiz (apex):
  - Tipo: `A Record`
  - Host: `@`
  - Value: IP mostrado no Render (se houver mais de um IP, crie um A para cada IP)
  - TTL: `Automatic`

- Subdomínio `www`:
  - Tipo: `CNAME Record`
  - Host: `www`
  - Value: destino mostrado no Render (ex.: `garcia-builder.onrender.com`)
  - TTL: `Automatic`

5) Remova registros conflitantes (ex.: `URL Redirect`, `Parking Page`, A/CNAME antigos para `@` ou `www`).
6) Clique em `Save All Changes`.

## Verificar e concluir no Render

1) Volte ao Render → Settings → Custom Domains e clique em `Verify` para cada domínio assim que a propagação DNS ocorrer (pode levar de minutos até 24h).
2) Defina um `Primary Domain` (recomendação: `www.garciabuilder.fitness`) para manter consistência de SEO.
3) O Render emitirá SSL automaticamente após a verificação.

## Atualizar CORS_ORIGINS no Render

Depois que os domínios forem verificados, atualize a variável de ambiente no Render:

```
CORS_ORIGINS=https://garciabuilder.fitness,https://www.garciabuilder.fitness,https://garciabuilder.uk,https://www.garciabuilder.uk,https://garcia-builder.onrender.com
```

Salve → `Save, rebuild, and deploy`.

## Atualizar Supabase e Stripe (se aplicável)

- Supabase → Project Settings → Auth → URL Configuration:
  - `Site URL`: use seu domínio primário (ex.: `https://www.garciabuilder.fitness`)
  - `Additional Redirect URLs`: adicione todos os domínios acima e o `.onrender.com`.
- Stripe:
  - Atualize URLs de sucesso/cancelamento e webhooks para o domínio primário (ex.: `https://www.garciabuilder.fitness/success.html`).

## Testes rápidos

- Abra `https://SEU-DOMINIO/health` → deve responder OK.
- Teste `https://SEU-DOMINIO/api/plans`.
- No navegador, verifique o Console de DevTools para garantir que não há erros de CORS.

## Solução de problemas

- Conflitos de DNS: remova registros antigos de `@` e `www` (URL Redirect, Parking, etc.).
- Propagação: aguarde até 24h. Você pode verificar com:
  - Windows PowerShell: `nslookup -type=A garciabuilder.fitness` e `nslookup -type=CNAME www.garciabuilder.fitness`
- SSL pendente: verifique se o DNS está correto e se o domínio já foi `Verify` no Render.
- CORS bloqueado: confirme que todos os domínios estão listados em `CORS_ORIGINS` (sem espaços, separados por vírgula) e redeploy.

---

Se preferir, defina `www.garciabuilder.uk` como primário para uma presença focada no Reino Unido. Basta manter a mesma lógica de registros e atualizar canônicos/sitemap para o domínio escolhido.
