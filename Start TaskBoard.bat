@echo off
setlocal
title TaskBoard Local Launcher
cd /d "%~dp0"

where npm >nul 2>&1
if errorlevel 1 (
  echo TaskBoard needs Node.js before it can run locally.
  echo Install Node.js from https://nodejs.org and try again.
  pause
  exit /b 1
)

echo Starting TaskBoard on this computer...
start "TaskBoard Local Server" cmd /k "cd /d ""%~dp0"" && npm run dev"
ping 127.0.0.1 -n 5 >nul
start "" "http://localhost:3000"

echo TaskBoard is opening in your default browser.
echo Keep the TaskBoard Local Server window open while using the app.
endlocal

