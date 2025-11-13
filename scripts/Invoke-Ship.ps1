param([ValidateSet("iron-brothers","garcia-builder")] [string]$Project)

$ErrorActionPreference = "Stop"

if ($Project -eq "iron-brothers") {
  $Path = "C:\dev\iron-brothers\starter-website"
  $Branch = "main"
} else {
  $Path = "C:\dev\Garcia-Builder"
  $Branch = "main"
}

Push-Location $Path
try {
  Write-Host "=== [Ship Script Running for $Project on branch '$Branch'] ==="

  # garantir que estamos na main
  git checkout $Branch
  git pull origin $Branch

  # verificar status e adicionar alterações
  git status -sb
  git add -A

  try {
    git commit -m "chore(ship): automated update from $Project"
  } catch {
    Write-Host "No new changes to commit."
  }

  # rodar testes/build
  npm run ci:full

  # push final para main
  git push origin $Branch

  Write-Host "✅ Ship completed successfully on branch $Branch"
} catch {
  Write-Host "❌ Ship failed: $($_.Exception.Message)"
} finally {
  Pop-Location
}
