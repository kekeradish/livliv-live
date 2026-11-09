@echo off
chcp 65001 >nul
rem LivLiv live avatar: transparent capture window for OBS. First run installs Electron (once, a few minutes).
cd /d "%~dp0"
if exist "desktop\node_modules\electron\dist\electron.exe" (
  start "" "desktop\node_modules\electron\dist\electron.exe" "desktop"
  exit /b 0
)
where node >nul 2>nul
if errorlevel 1 call :find_node
where node >nul 2>nul
if errorlevel 1 (
  echo 需要先安装 Node.js ^(https://nodejs.org/^)，装好后重新双击本文件。
  pause
  exit /b 1
)
echo First run: installing Electron, this may take a few minutes...
set "ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/"
call npm --prefix desktop install --no-audit --no-fund
if errorlevel 1 (
  echo Install failed. Check your network and run this again.
  pause
  exit /b 1
)
start "" "desktop\node_modules\electron\dist\electron.exe" "desktop"
exit /b 0

rem Node installed but not added to PATH: use the usual install folder
:find_node
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "D:\Program Files\nodejs\node.exe" set "PATH=D:\Program Files\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
exit /b 0
