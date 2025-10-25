# Script para limpar navbars duplicadas inline que conflitam com o component loader
# Remove todo markup inline após o placeholder <div data-component="navbar"></div>

$ErrorActionPreference = 'Stop'

Write-Host "`n=== LIMPEZA DE NAVBARS DUPLICADAS ===" -ForegroundColor Cyan

# Arquivos que precisam de limpeza (baseado na análise grep)
$filesToClean = @(
    "contact.html",
    "transformations.html",
    "faq.html",
    "testimonials.html",
    "blog.html",
    "about.html"
)

# Pattern para identificar o bloco duplicado que começa após o placeholder
$duplicatePattern = @'
(?s)<div data-component="navbar"></div>\s*<div class="gb-menu-footer">.*?</nav>\s*<script>.*?</script>\s*<div id="auth-buttons"></div>\s*</div>\s*</nav>
'@

$replacementText = '<div data-component="navbar"></div>'

$filesProcessed = 0
$filesModified = 0

foreach ($file in $filesToClean) {
    $filePath = Join-Path $PSScriptRoot "..\..\$file"
    
    if (-Not (Test-Path $filePath)) {
        Write-Host "⏭️  Pulando $file (não encontrado)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n📄 Processando: $file" -ForegroundColor White
    $filesProcessed++
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Verifica se tem o padrão duplicado
        if ($content -match '<div class="gb-menu-footer">') {
            Write-Host "   ✅ Navbar duplicada detectada - limpando..." -ForegroundColor Green
            
            # Remove todo o bloco duplicado após o placeholder
            # Método 1: Remove tudo entre o placeholder e a próxima section/main tag
            $pattern1 = '(?s)(<div data-component="navbar"></div>)\s*<div class="gb-menu-footer">.*?</nav>\s*<script>.*?</script>\s*.*?</nav>\s*(?=<(?:section|main|div class="contact-hero"|div class="transformations-hero"))'
            
            if ($content -match $pattern1) {
                $content = $content -replace $pattern1, '$1' + "`n`n"
                $filesModified++
                Write-Host "   ✓ Markup duplicado removido" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Pattern não encontrado, tentando método alternativo..." -ForegroundColor Yellow
                
                # Método 2: Remove linha por linha
                $lines = $content -split "`n"
                $newLines = @()
                $skipMode = $false
                $foundPlaceholder = $false
                
                foreach ($line in $lines) {
                    if ($line -match '<div data-component="navbar"></div>') {
                        $newLines += $line
                        $foundPlaceholder = $true
                        $skipMode = $true
                        continue
                    }
                    
                    if ($skipMode) {
                        # Para quando encontrar próxima section
                        if ($line -match '<section|<main|class="contact-hero"|class="transformations-hero"') {
                            $skipMode = $false
                            $newLines += $line
                        }
                        continue
                    }
                    
                    $newLines += $line
                }
                
                if ($foundPlaceholder) {
                    $content = $newLines -join "`n"
                    $filesModified++
                    Write-Host "   ✓ Limpeza alternativa aplicada" -ForegroundColor Green
                }
            }
            
            # Salva o arquivo limpo
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "   💾 Arquivo salvo" -ForegroundColor Green
            
        } else {
            Write-Host "   ℹ️  Arquivo já está limpo" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "   ❌ ERRO: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Arquivos processados: $filesProcessed" -ForegroundColor White
Write-Host "Arquivos modificados: $filesModified" -ForegroundColor Green

if ($filesModified -gt 0) {
    Write-Host "`n✅ Limpeza concluída! Teste os arquivos no navegador." -ForegroundColor Green
} else {
    Write-Host "`nℹ️  Nenhuma modificação necessária." -ForegroundColor Gray
}

Write-Host ""
