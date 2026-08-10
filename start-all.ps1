Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting WPBrigade AI Chatbot  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n[1/2] Checking & Installing dependencies..." -ForegroundColor Yellow

Set-Location "$PSScriptRoot\server"
Write-Host "Installing server packages in $PWD..." -ForegroundColor Gray
npm install

Set-Location "$PSScriptRoot\client"
Write-Host "Installing client packages in $PWD..." -ForegroundColor Gray
npm install

Set-Location "$PSScriptRoot"

Write-Host "`n[2/2] Launching Server & Client services..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm run dev"

Write-Host "`nServer: http://localhost:5000" -ForegroundColor Green
Write-Host "Client: http://localhost:3000" -ForegroundColor Green
