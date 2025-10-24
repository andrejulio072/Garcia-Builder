# Deploy script para Vercel
# Executa deploy com respostas automáticas

Write-Host "🚀 Iniciando deploy para Vercel..." -ForegroundColor Cyan

# Configurar respostas automáticas
$env:CI = "true"

# Executar deploy
cd "C:\Users\andre\OneDrive\Área de Trabalho\Garcia-Builder\Garcia-Builder"

# Deploy com flag --yes para aceitar automaticamente
npx vercel --prod --yes --token $env:VERCEL_TOKEN

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
