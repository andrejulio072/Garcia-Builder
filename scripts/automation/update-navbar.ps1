# Script para atualizar navbar em multiplas paginas HTML

$pages = @(
    "programs.html",
    "testimonials.html",
    "login.html",
    "forgot-password.html",
    "reset-password.html",
    "lead-magnet.html",
    "thanks-ebook.html",
    "success.html",
    "first-workout.html",
    "dashboard.html",
    "my-profile.html"
)

$oldPattern = @"
            <button class="gb-hamburger"
                    id="gb-menu-toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                    aria-controls="gb-menu">
"@

$newPattern = @"
            <div class="gb-navbar-controls">
                <div id="auth-buttons-navbar"></div>
                <select id="lang-select-navbar" aria-label="Select Language" title="Select Language">
                    <option value="en">EN</option>
                    <option value="pt">PT</option>
                    <option value="es">ES</option>
                </select>
            </div>

            <button class="gb-hamburger"
                    id="gb-menu-toggle"
                    aria-label="Toggle navigation menu"
                    aria-expanded="false"
                    aria-controls="gb-menu">
"@

foreach ($page in $pages) {
    $filePath = Join-Path $PSScriptRoot $page
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        if ($content -match [regex]::Escape($oldPattern)) {
            $content = $content -replace [regex]::Escape($oldPattern), $newPattern
            Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Updated: $page" -ForegroundColor Green
        } else {
            Write-Host "Pattern not found or already updated: $page" -ForegroundColor Yellow
        }
    } else {
        Write-Host "File not found: $page" -ForegroundColor Red
    }
}

Write-Host "`nUpdate complete!" -ForegroundColor Cyan
