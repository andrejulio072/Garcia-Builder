param([ValidateSet("iron-brothers","garcia-builder")] [string]$Project)

$ErrorActionPreference = "Stop"

if ($Project -eq "iron-brothers") {
  $Path = "C:\dev\iron-brothers\starter-website"
  $Branch = "feature/professional-overhaul"
} else {
  $Path = "C:\dev\Garcia-Builder"
  $Branch = "cleanup/" + (Get-Date -Format 'yyyy-MM-dd')
}

Push-Location $Path
try {
  git status -sb | Out-Host

  try {
    git rev-parse --verify $Branch > $null 2>&1
    git checkout $Branch | Out-Host
  } catch {
    git checkout -b $Branch | Out-Host
  }

  git add -A | Out-Host
  git commit -m "chore: routine ship pipeline" 2>$null | Out-Host

  npm run ci:full | Out-Host

  git push --set-upstream origin $Branch | Out-Host
} finally {
  Pop-Location
}
