$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host 'Validando o frontend...'
npm run build

Write-Host 'Validando backend e fluxo completo...'
& '.\backend\mvnw.cmd' -f '.\backend\pom.xml' test
