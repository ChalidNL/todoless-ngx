param(
  [string]$PocketBaseExe = ".\pocketbase.exe",
  [int]$PocketBasePort = 8090,
  [int]$VitePort = 5173
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (!(Test-Path ".env")) {
  @"
VITE_POCKETBASE_URL=http://127.0.0.1:$PocketBasePort
WEBUI_PORT=7070
TZ=UTC
"@ | Set-Content -Encoding UTF8 ".env"
  Write-Host "Created .env with local defaults." -ForegroundColor Green
}

if (!(Test-Path "node_modules")) {
  Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
  npm install
  if ($LASTEXITCODE -ne 0) {
    throw "npm install failed"
  }
}

$pbCommand = if (Test-Path $PocketBaseExe) {
  "Set-Location '$PSScriptRoot'; & '$PocketBaseExe' serve --dir '.\pb_data' --http 127.0.0.1:$PocketBasePort"
} else {
  "Set-Location '$PSScriptRoot'; pocketbase serve --dir '.\pb_data' --http 127.0.0.1:$PocketBasePort"
}

Write-Host "Starting PocketBase..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $pbCommand | Out-Null

Write-Host "Starting Vite dev server on port $VitePort..." -ForegroundColor Cyan
npm run dev -- --host 127.0.0.1 --port $VitePort
