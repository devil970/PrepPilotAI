@echo off
echo =====================================================================
echo  Stopping PrepPilot AI Server Processes
echo =====================================================================

taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe /fi "WINDOWTITLE eq PrepPilot*" >nul 2>&1

echo [OK] PrepPilot AI services safely stopped.
pause
