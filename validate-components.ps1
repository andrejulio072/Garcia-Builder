# Component Validation Script
Write-Host "Component Validation" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

$pages = @('index.html', 'about.html', 'transformations.html', 'testimonials.html', 'contact.html', 'faq.html', 'blog.html', 'pricing.html')
$errors = 0

foreach($page in $pages) {
    if(!(Test-Path $page)) { continue }
    
    $content = Get-Content $page -Raw
    Write-Host "Checking $page..."
    
    if($content -notmatch 'data-component="navbar"') {
        Write-Host "  [ERROR] Missing navbar" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  [OK] Navbar found" -ForegroundColor Green
    }
    
    if($content -notmatch 'data-component="footer"') {
        Write-Host "  [ERROR] Missing footer" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  [OK] Footer found" -ForegroundColor Green
    }
    
    if($content -notmatch 'component-loader') {
        Write-Host "  [ERROR] Missing component-loader" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  [OK] Component loader found" -ForegroundColor Green
    }
    
    if($content -notmatch 'navbar-component\.css') {
        Write-Host "  [ERROR] Missing navbar CSS" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "  [OK] Navbar CSS found" -ForegroundColor Green
    }
}

if($errors -eq 0) {
    Write-Host "`nALL CHECKS PASSED" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nFOUND $errors ERRORS" -ForegroundColor Red
    exit 1
}
