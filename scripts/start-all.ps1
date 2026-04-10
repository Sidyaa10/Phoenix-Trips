param(
  [int]$FrontendPort = 3000,
  [int]$BackendPort = 5001
)

$ErrorActionPreference = "Stop"

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runtimeRoot = "C:\temp\flight-app-run"

$frontendOut = Join-Path $env:TEMP "flight-ui-live-out.log"
$frontendErr = Join-Path $env:TEMP "flight-ui-live-err.log"
$backendOut = Join-Path $env:TEMP "flight-backend-live-out.log"
$backendErr = Join-Path $env:TEMP "flight-backend-live-err.log"

function Wait-ForHttp {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
    }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  return $false
}

function Sync-Runtime {
  if (-not (Test-Path $runtimeRoot)) {
    New-Item -ItemType Directory -Path $runtimeRoot | Out-Null
  }

  robocopy (Join-Path $sourceRoot "src") (Join-Path $runtimeRoot "src") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  robocopy (Join-Path $sourceRoot "public") (Join-Path $runtimeRoot "public") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  robocopy (Join-Path $sourceRoot "server") (Join-Path $runtimeRoot "server") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null

  foreach ($file in @("package.json", "package-lock.json", "postcss.config.js", "tailwind.config.js")) {
    $srcFile = Join-Path $sourceRoot $file
    if (Test-Path $srcFile) {
      Copy-Item $srcFile $runtimeRoot -Force
    }
  }
}

function Stop-ExistingProcesses {
  Get-CimInstance Win32_Process |
    Where-Object {
      ($_.Name -eq "node.exe" -or $_.Name -eq "npm.cmd" -or $_.Name -eq "cmd.exe" -or $_.Name -eq "powershell.exe") -and
      ($_.CommandLine -like "*flight-app-run*" -or $_.CommandLine -like "*flight-app*start-all.ps1*")
    } |
    ForEach-Object {
      Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

function Ensure-Dependencies {
  if (-not (Test-Path (Join-Path $runtimeRoot "node_modules"))) {
    Write-Host "Installing dependencies in stable runtime..."
    Push-Location $runtimeRoot
    try {
      npm install --legacy-peer-deps
    } finally {
      Pop-Location
    }
  }
}

function Start-Backend {
  Remove-Item $backendOut, $backendErr -Force -ErrorAction SilentlyContinue
  Start-Process -FilePath npm.cmd `
    -ArgumentList "run server" `
    -WorkingDirectory $runtimeRoot `
    -RedirectStandardOutput $backendOut `
    -RedirectStandardError $backendErr | Out-Null
}

function Start-Frontend {
  Remove-Item $frontendOut, $frontendErr -Force -ErrorAction SilentlyContinue
  Start-Process -FilePath cmd.exe `
    -ArgumentList "/c set PORT=$FrontendPort&& set BROWSER=none&& npm start" `
    -WorkingDirectory $runtimeRoot `
    -RedirectStandardOutput $frontendOut `
    -RedirectStandardError $frontendErr | Out-Null
}

Write-Host "Syncing Phoenix Trips into stable runtime..."
Sync-Runtime

Write-Host "Stopping old app processes..."
Stop-ExistingProcesses

Ensure-Dependencies

Write-Host "Starting backend on port $BackendPort..."
Start-Backend

Write-Host "Starting frontend on port $FrontendPort..."
Start-Frontend

$backendUrl = "http://127.0.0.1:$BackendPort/api/health"
$frontendUrl = "http://127.0.0.1:$FrontendPort"

$backendOk = Wait-ForHttp -Url $backendUrl -TimeoutSeconds 45
$frontendOk = Wait-ForHttp -Url $frontendUrl -TimeoutSeconds 90

if ($backendOk -and $frontendOk) {
  Write-Host ""
  Write-Host "Phoenix Trips is up."
  Write-Host "Frontend: http://localhost:$FrontendPort"
  Write-Host "Backend:  $backendUrl"
  exit 0
}

Write-Host ""
Write-Host "Startup did not fully succeed."
Write-Host "Frontend log: $frontendOut"
Write-Host "Frontend err: $frontendErr"
Write-Host "Backend log:  $backendOut"
Write-Host "Backend err:  $backendErr"

if (Test-Path $frontendOut) {
  Write-Host ""
  Write-Host "Frontend output:"
  Get-Content $frontendOut -Tail 40
}

if (Test-Path $frontendErr) {
  Write-Host ""
  Write-Host "Frontend errors:"
  Get-Content $frontendErr -Tail 40
}

if (Test-Path $backendOut) {
  Write-Host ""
  Write-Host "Backend output:"
  Get-Content $backendOut -Tail 40
}

if (Test-Path $backendErr) {
  Write-Host ""
  Write-Host "Backend errors:"
  Get-Content $backendErr -Tail 40
}

exit 1
