@echo off
chcp 65001 >nul
rem Launches a dedicated Chrome for the livestream with Windows window-occlusion detection off:
rem otherwise Chrome stops drawing the moment OBS covers the browser, and OBS captures a frozen frame.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 call :find_node
where node >nul 2>nul
if errorlevel 1 (
  echo 需要先安装 Node.js ^(https://nodejs.org/^)，装好后重新双击本文件。
  pause
  exit /b 1
)
set "PORT=5173"
set "URL=http://127.0.0.1:%PORT%/example/live-console.html"

rem start the static server if it is not already listening
powershell -WindowStyle Hidden -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient; try { $c.Connect('127.0.0.1',%PORT%) } catch { Start-Process -WindowStyle Hidden -FilePath 'node' -ArgumentList 'serve.mjs','%PORT%' -WorkingDirectory '%CD%' } finally { $c.Close() }"

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo Chrome not found. Install Chrome, or edit this file with the path to your chrome.exe.
  pause
  exit /b 1
)

start "" "%CHROME%" ^
  --user-data-dir="%LocalAppData%\LivLivLive" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling ^
  --disable-backgrounding-occluded-windows ^
  --disable-renderer-backgrounding ^
  --disable-background-timer-throttling ^
  --autoplay-policy=no-user-gesture-required ^
  --app="%URL%" ^
  --window-size=1200,900
exit /b 0

rem Node installed but not added to PATH: use the usual install folder
:find_node
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "D:\Program Files\nodejs\node.exe" set "PATH=D:\Program Files\nodejs;%PATH%"
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
exit /b 0
