@echo off
echo =====================================================================
echo  PrepPilot AI – Python Environment Verification
echo =====================================================================

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python is installed and ready.
echo [INFO] No Node.js, npm, or React are needed!
echo.
echo =====================================================================
echo  Ready to Launch!
echo  To start PrepPilot AI, simply run:
echo      run.bat
echo    or:
echo      python main.py
echo =====================================================================
pause
