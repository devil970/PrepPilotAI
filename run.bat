@echo off
echo =====================================================================
echo  PrepPilot AI – 100%% Pure Python Runner (Zero Node.js / Zero React)
echo =====================================================================

REM 1. Verify Python is installed
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10 or higher from https://www.python.org/
    pause
    exit /b 1
)

REM 2. Start Python server directly (No Node.js, No React, No npm needed)
echo [START] Starting PrepPilot AI using Python Standard Library...
echo [INFO] Zero third-party dependencies required.
echo [INFO] Opening http://localhost:5000 in your browser...
python main.py

pause
