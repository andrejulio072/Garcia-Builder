# Script para atualizar todos os paths nos arquivos HTML
# Desenvolvido para Garcia-Builder apos reorganizacao de estrutura

Write-Host "Iniciando atualizacao de paths em todos os arquivos HTML..." -ForegroundColor Cyan

# Define o diretório raiz (dois níveis acima do script)
$rootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

# Encontra todos os arquivos HTML exceto index.html (já atualizado)
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object { $_.Name -ne "index.html" }

Write-Host "Encontrados $($htmlFiles.Count) arquivos HTML para atualizar" -ForegroundColor Yellow

$totalUpdates = 0

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileUpdates = 0
    
    # ========== CSS UPDATES ==========
    # Components
    $content = $content -replace 'href="css/enhanced-navbar\.css', 'href="css/components/enhanced-navbar.css'
    $content = $content -replace 'href="css/newsletter\.css', 'href="css/components/newsletter.css'
    $content = $content -replace 'href="css/credibility\.css', 'href="css/components/credibility.css'
    
    # Pages
    $content = $content -replace 'href="css/homepage\.css', 'href="css/pages/homepage.css'
    $content = $content -replace 'href="css/auth\.css', 'href="css/pages/auth.css'
    $content = $content -replace 'href="css/kpi6\.css', 'href="css/pages/kpi6.css'
    
    # Admin
    $content = $content -replace 'href="css/dashboard\.css', 'href="css/admin/dashboard.css'
    $content = $content -replace 'href="css/dashboard-admin\.css', 'href="css/admin/dashboard-admin.css'
    $content = $content -replace 'href="css/enhanced-dashboard\.css', 'href="css/admin/enhanced-dashboard.css'
    
    # ========== JS UPDATES - CORE ==========
    $content = $content -replace 'src="js/supabase-config\.js', 'src="js/core/supabase-config.js'
    $content = $content -replace 'src="js/auth\.js', 'src="js/core/auth.js'
    $content = $content -replace 'src="js/auth-supabase\.js', 'src="js/core/auth-supabase.js'
    $content = $content -replace 'src="js/enhanced-auth\.js', 'src="js/core/enhanced-auth.js'
    $content = $content -replace 'src="js/auth-guard\.js', 'src="js/core/auth-guard.js'
    $content = $content -replace 'src="js/stripe-config\.js', 'src="js/core/stripe-config.js'
    $content = $content -replace 'src="js/currency-converter\.js', 'src="js/core/currency-converter.js'
    $content = $content -replace 'src="js/i18n-shim\.js', 'src="js/core/i18n-shim.js'
    
    # ========== JS UPDATES - COMPONENTS ==========
    $content = $content -replace 'src="js/navbar\.js', 'src="js/components/navbar.js'
    $content = $content -replace 'src="js/contact-form\.js', 'src="js/components/contact-form.js'
    $content = $content -replace 'src="js/newsletter-manager\.js', 'src="js/components/newsletter-manager.js'
    $content = $content -replace 'src="js/lightbox\.js', 'src="js/components/lightbox.js'
    $content = $content -replace 'src="js/testimonials-', 'src="js/components/testimonials-'
    $content = $content -replace 'src="js/about-cards\.js', 'src="js/components/about-cards.js'
    $content = $content -replace 'src="js/number-animate\.js', 'src="js/components/number-animate.js'
    $content = $content -replace 'src="js/app\.js', 'src="js/components/app.js'
    $content = $content -replace 'src="js/kpi6\.inject\.js', 'src="js/components/kpi6.inject.js'
    $content = $content -replace 'src="js/credibility\.inject\.js', 'src="js/components/credibility.inject.js'
    $content = $content -replace 'src="js/navigation-manager\.js', 'src="js/components/navigation-manager.js'
    
    # ========== JS UPDATES - ADMIN ==========
    $content = $content -replace 'src="js/admin-dashboard\.js', 'src="js/admin/admin-dashboard.js'
    $content = $content -replace 'src="js/trainer-dashboard\.js', 'src="js/admin/trainer-dashboard.js'
    $content = $content -replace 'src="js/profile-manager\.js', 'src="js/admin/profile-manager.js'
    $content = $content -replace 'src="js/enhanced-dashboard\.js', 'src="js/admin/enhanced-dashboard.js'
    
    # ========== JS UPDATES - TRACKING ==========
    $content = $content -replace 'src="js/ads-config\.js', 'src="js/tracking/ads-config.js'
    $content = $content -replace 'src="js/ads-loader\.js', 'src="js/tracking/ads-loader.js'
    $content = $content -replace 'src="js/pixel-init\.js', 'src="js/tracking/pixel-init.js'
    $content = $content -replace 'src="js/analytics-test-helper\.js', 'src="js/tracking/analytics-test-helper.js'
    $content = $content -replace 'src="js/consent-banner\.js', 'src="js/tracking/consent-banner.js'
    $content = $content -replace 'src="js/conversion-helper\.js', 'src="js/tracking/conversion-helper.js'
    $content = $content -replace 'src="js/engagement-tracking\.js', 'src="js/tracking/engagement-tracking.js'
    $content = $content -replace 'src="js/utm-capture\.js', 'src="js/tracking/utm-capture.js'
    $content = $content -replace 'src="js/web-vitals-rum\.js', 'src="js/tracking/web-vitals-rum.js'
    
    # Verifica se houve mudanças
    if ($content -ne $originalContent) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $fileUpdates++
        $totalUpdates++
        Write-Host "  OK $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  SKIP $($file.Name) - sem alteracoes" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Atualizacao concluida!" -ForegroundColor Cyan
Write-Host "Total de arquivos atualizados: $totalUpdates de $($htmlFiles.Count)" -ForegroundColor Yellow
Write-Host ""
