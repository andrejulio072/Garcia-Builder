# Garcia Builder - Logo Test Script (PowerShell)
# Quick validation of logo implementation

Write-Host "🧪 Garcia Builder - Logo Test Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Test 1: Check if logo files exist
Write-Host "`n📁 Testing logo file existence..." -ForegroundColor Yellow
$logoPath = "Logo Files\For Web\logo-nobackground-500.png"
if (Test-Path $logoPath) {
    Write-Host "✅ Logo file exists" -ForegroundColor Green
    $logoExists = $true
} else {
    Write-Host "❌ Logo file not found" -ForegroundColor Red
    $logoExists = $false
}

# Test 2: Check for old references in HTML files
Write-Host "`n🔍 Scanning for old logo references..." -ForegroundColor Yellow
$oldRefs = @()
Get-ChildItem -Name "*.html" | ForEach-Object {
    $content = Get-Content $_ -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "assets/logo\.png") {
        $oldRefs += $_
    }
}

if ($oldRefs.Count -eq 0) {
    Write-Host "✅ No old logo references found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found old logo references in: $($oldRefs -join ', ')" -ForegroundColor Yellow
}

# Test 3: Check CSS for white backgrounds on logos
Write-Host "`n🎨 Checking CSS for white backgrounds..." -ForegroundColor Yellow
$cssContent = Get-Content "css\global.css" -Raw -ErrorAction SilentlyContinue
$whiteBgFound = $false
if ($cssContent) {
    # Check for white backgrounds in brand or footer img sections
    if ($cssContent -match "\.brand\s+img[^}]*background:\s*#fff" -or
        $cssContent -match "\.footer\s+img[^}]*background:\s*#fff") {
        Write-Host "⚠️  Found white backgrounds in logo CSS" -ForegroundColor Yellow
        $whiteBgFound = $true
    } else {
        Write-Host "✅ No white backgrounds found in logo styles" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Could not read CSS file" -ForegroundColor Yellow
}

# Test 4: Count logo instances
Write-Host "`n📊 Counting logo instances..." -ForegroundColor Yellow
$totalLogos = 0
Get-ChildItem -Name "*.html" | ForEach-Object {
    $content = Get-Content $_ -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $matches = [regex]::Matches($content, "logo-nobackground-500\.png")
        $totalLogos += $matches.Count
    }
}
Write-Host "📈 Found $totalLogos logo references in HTML files" -ForegroundColor Cyan

# Test 5: Check path consistency (lowercase vs uppercase)
Write-Host "`n🔗 Checking path consistency..." -ForegroundColor Yellow
$inconsistentPaths = @()
Get-ChildItem -Name "*.html" | ForEach-Object {
    $content = Get-Content $_ -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match "logo files/For Web") {
        $inconsistentPaths += $_
    }
}

if ($inconsistentPaths.Count -eq 0) {
    Write-Host "✅ All logo paths are consistent" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found inconsistent paths in: $($inconsistentPaths -join ', ')" -ForegroundColor Yellow
}

# Test 6: Check favicon references
Write-Host "`n🌐 Checking favicon references..." -ForegroundColor Yellow
$faviconCount = 0
Get-ChildItem -Name "*.html" | ForEach-Object {
    $content = Get-Content $_ -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'rel=["\']icon["\'][^>]*logo-nobackground-500\.png') {
        $faviconCount++
    }
}
Write-Host "🔗 Found $faviconCount pages with correct favicon" -ForegroundColor Cyan

# Summary
Write-Host "`n🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$allTestsPassed = $logoExists -and ($oldRefs.Count -eq 0) -and (-not $whiteBgFound) -and ($inconsistentPaths.Count -eq 0)

if ($allTestsPassed) {
    Write-Host "🎉 All tests PASSED! Logo implementation is clean!" -ForegroundColor Green
    Write-Host "📊 Total logo instances: $totalLogos" -ForegroundColor Cyan
    Write-Host "🔗 Favicon references: $faviconCount" -ForegroundColor Cyan
    Write-Host "🌐 Ready for production!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some issues found. Please review above." -ForegroundColor Yellow
}

# File size check
if (Test-Path $logoPath) {
    $logoSize = (Get-Item $logoPath).Length
    $logoSizeKB = [math]::Round($logoSize / 1024, 2)
    Write-Host "📏 Logo file size: $logoSizeKB KB" -ForegroundColor Cyan

    if ($logoSizeKB -lt 100) {
        Write-Host "✅ Logo file size is optimized" -ForegroundColor Green
    } elseif ($logoSizeKB -lt 200) {
        Write-Host "⚠️  Logo file size is acceptable but could be optimized" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Logo file size is large, consider optimization" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "- Open http://localhost:8000/test-logo-validation.html for visual tests"
Write-Host "- Open http://localhost:8000/test-performance.html for performance tests"
Write-Host "- Check individual pages for logo appearance"
Write-Host "- Use browser dev tools to inspect logo background transparency"

# Quick validation URLs
Write-Host "`n🔗 Quick Test URLs:" -ForegroundColor Cyan
$testPages = @("index.html", "about.html", "testimonials.html", "pricing.html")
foreach ($page in $testPages) {
    Write-Host "   http://localhost:8000/$page"
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
