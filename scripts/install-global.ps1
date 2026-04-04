param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cliPath = Join-Path $repoRoot 'dist\cli.js'

if (-not (Test-Path -LiteralPath $cliPath)) {
  if ($SkipBuild) {
    throw "Built CLI not found at $cliPath. Run 'bun run build' first."
  }

  Write-Host 'dist/cli.js not found. Building project first...' -ForegroundColor Yellow
  Push-Location $repoRoot
  try {
    bun run build
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path -LiteralPath $cliPath)) {
  throw "Build did not produce expected CLI file: $cliPath"
}

$launcherPath = Join-Path $env:USERPROFILE 'claudecode.cmd'
$launcherContent = "@echo off`r`nnode ""$cliPath"" %*"
Set-Content -LiteralPath $launcherPath -Value $launcherContent -Encoding Ascii

$profileDir = $env:USERPROFILE
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')

$pathParts = @()
if (-not [string]::IsNullOrWhiteSpace($userPath)) {
  $pathParts = $userPath -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
}

if ($pathParts -notcontains $profileDir) {
  $newUserPath = if ($pathParts.Count -gt 0) {
    ($pathParts + $profileDir) -join ';'
  } else {
    $profileDir
  }

  [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')
  Write-Host "Added $profileDir to User PATH" -ForegroundColor Green
} else {
  Write-Host 'User PATH already contains profile directory' -ForegroundColor DarkGray
}

if (($env:Path -split ';') -notcontains $profileDir) {
  $env:Path = "$env:Path;$profileDir"
}

Write-Host "Installed global launcher: $launcherPath" -ForegroundColor Green
Write-Host 'Testing: claudecode --version' -ForegroundColor Cyan
& claudecode --version
Write-Host 'Global install complete. If another terminal does not find claudecode, reopen that terminal.' -ForegroundColor Green
