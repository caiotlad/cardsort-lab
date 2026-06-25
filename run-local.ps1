$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

if (-not (Test-Path 'node_modules')) {
  npm install --cache .npm-cache
}

Write-Host 'Preparando o frontend...'
npm run build

Push-Location '.\backend'
try {
  $jar = '.\target\cardsort-api-0.1.0.jar'
  $sourceFiles = Get-ChildItem '.\src' -Recurse -File
  $needsBuild = -not (Test-Path $jar)
  if (-not $needsBuild) {
    $jarTime = (Get-Item $jar).LastWriteTimeUtc
    $needsBuild = $sourceFiles | Where-Object { $_.LastWriteTimeUtc -gt $jarTime } | Select-Object -First 1
  }

  if ($needsBuild) {
    Write-Host 'Preparando o backend Java...'
    & '.\mvnw.cmd' package -DskipTests
    if ($LASTEXITCODE -ne 0) {
      throw 'Não foi possível compilar o backend Java.'
    }
  }

  Write-Host ''
  Write-Host 'CardSort Lab disponível em http://127.0.0.1:8080'
  Write-Host 'Mantenha esta janela aberta enquanto estiver usando o sistema.'
  Write-Host ''
  & java -jar $jar
} finally {
  Pop-Location
}
