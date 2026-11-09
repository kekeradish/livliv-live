@echo off
chcp 65001 >nul
rem LivLiv live avatar: transparent capture window for OBS. First run installs Electron (once, a few minutes).
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 需要先安装 Node.js ^(https://nodejs.org/^)，装好后重新双击本文件。
  pause
  exit /b 1
)
if not exist "desktop\node_modules\electron\dist\electron.exe" (
  echo First run: installing Electron, this may take a few minutes...
  set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
  call npm --prefix desktop install --no-audit --no-fund
  if errorlevel 1 (
    echo Install failed. Check your network and run this again.
    pause
    exit /b 1
  )
)
start "" "desktop\node_modules\electron\dist\electron.exe" "desktop"
