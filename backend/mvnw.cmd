@echo off
setlocal

where mvn >nul 2>nul
if %errorlevel%==0 (
  mvn %*
  exit /b %errorlevel%
)

set "MAVEN_INTELLIJ=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.2.3\plugins\maven\lib\maven3\bin\mvn.cmd"
if exist "%MAVEN_INTELLIJ%" (
  call "%MAVEN_INTELLIJ%" %*
  exit /b %errorlevel%
)

set "MAVEN_INTELLIJ_ULTIMATE=C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.4\plugins\maven\lib\maven3\bin\mvn.cmd"
if exist "%MAVEN_INTELLIJ_ULTIMATE%" (
  call "%MAVEN_INTELLIJ_ULTIMATE%" %*
  exit /b %errorlevel%
)

echo Maven nao encontrado. Instale o Maven ou abra o projeto pelo IntelliJ.
exit /b 1
