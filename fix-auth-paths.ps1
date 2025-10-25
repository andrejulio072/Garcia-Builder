# Fix Auth Pages Relative Paths
$authPages = @("pages\auth\forgot-password.html", "pages\auth\reset-password.html")

foreach ($file in $authPages) {
    if (Test-Path $file) {
        Write-Host "Fixing $file..." -ForegroundColor Cyan
        
        $content = Get-Content $file -Raw
        
        # CSS paths
        $content = $content -replace 'href="css/', 'href="../../css/'
        
        # JS paths
        $content = $content -replace 'src="js/', 'src="../../js/'
        $content = $content -replace 'src="assets/', 'src="../../assets/'
        
        # Logo paths
        $content = $content -replace 'src="Logo Files/', 'src="../../Logo Files/'
        
        # Navigation links
        $content = $content -replace 'href="index\.html"', 'href="../../index.html"'
        $content = $content -replace 'href="about\.html"', 'href="../../about.html"'
        $content = $content -replace 'href="transformations\.html"', 'href="../../transformations.html"'
        $content = $content -replace 'href="testimonials\.html"', 'href="../../testimonials.html"'
        $content = $content -replace 'href="pricing\.html"', 'href="../../pricing.html"'
        $content = $content -replace 'href="blog\.html"', 'href="../../blog.html"'
        $content = $content -replace 'href="faq\.html"', 'href="../../faq.html"'
        $content = $content -replace 'href="contact\.html"', 'href="../../contact.html"'
        
        # Assets links
        $content = $content -replace 'href="assets/', 'href="../../assets/'
        
        Set-Content $file $content -NoNewline
        Write-Host "✓ $file fixed!" -ForegroundColor Green
    }
}

Write-Host "`n✅ All auth pages fixed!" -ForegroundColor Green
