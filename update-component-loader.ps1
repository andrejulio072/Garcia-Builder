# Script para atualizar component-loader em todas as páginas HTML
# De: component-loader.js (v2.0) 
# Para: component-loader-v3-simplified.js (v3.0)

$files = @(
    "about.html",
    "pricing.html",
    "contact.html",
    "faq.html",
    "testimonials.html",
    "transformations.html",
    "blog.html",
    "programs.html"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Atualizando $file..." -ForegroundColor Yellow
        
        # Ler conteúdo
        $content = Get-Content $file -Raw -Encoding UTF8
        
        # Substituir component-loader.js por component-loader-v3-simplified.js
        $content = $content -replace 'component-loader\.js\?v=\d+', 'component-loader-v3-simplified.js?v=20251027'
        
        # Adicionar defer se não tiver
        $content = $content -replace '<script src="js/utils/component-loader', '<script defer src="js/utils/component-loader'
        
        # Salvar
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        
        Write-Host "✓ $file atualizado!" -ForegroundColor Green
    } else {
        Write-Host "⚠ $file não encontrado!" -ForegroundColor Red
    }
}

Write-Host "`n✅ Atualização concluída!" -ForegroundColor Green
Write-Host "Arquivos atualizados: $($files.Count)" -ForegroundColor Cyan
