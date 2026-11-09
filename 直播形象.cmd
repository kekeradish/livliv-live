@echo off
rem LivLiv live avatar: transparent capture window for OBS. First run installs Electron (once, a few minutes).
cd /d "%~dp0"
if not exist "desktop\node_modules\electron\dist\electron.exe" (
  echo First run: installing Electron, this may take a few minutes...
  call npm --prefix desktop install --no-audit --no-fund
  if errorlevel 1 (
    echo Install failed. Check your network and run this again.
    pause
    exit /b 1
  )
)
start "" "desktop\node_modules\electron\dist\electron.exe" "desktop"
