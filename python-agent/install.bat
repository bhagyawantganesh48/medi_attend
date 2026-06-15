@echo off
:: ============================================================
:: Smart Internship Attendance Tracker
:: Windows Auto-Start Installer
::
:: This script registers the Python agent as a Windows Task
:: Scheduler job that starts automatically when you log in.
::
:: Run this as Administrator!
:: ============================================================

SET AGENT_DIR=%~dp0
SET AGENT_SCRIPT=%AGENT_DIR%agent.py
SET TASK_NAME=SmartAttendanceAgent

echo.
echo ============================================================
echo   Smart Internship Attendance Agent — Windows Auto-Start
echo ============================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo         Please install Python from https://python.org
    pause
    exit /b 1
)

:: Install dependencies
echo [1/3] Installing Python dependencies...
pip install -r "%AGENT_DIR%requirements.txt" --quiet
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo       Done.

:: Remove existing task if present
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Create the scheduled task
:: Trigger: At log on of current user
:: Action: Run pythonw.exe (no console window) with agent.py
echo [2/3] Registering Windows Task Scheduler job...
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "pythonw.exe \"%AGENT_SCRIPT%\"" ^
  /sc ONLOGON ^
  /delay 0001:00 ^
  /ru "%USERNAME%" ^
  /f

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create scheduled task.
    echo         Make sure you are running this as Administrator.
    pause
    exit /b 1
)
echo       Done.

:: Start the task immediately
echo [3/3] Starting agent now...
schtasks /run /tn "%TASK_NAME%"
echo       Done.

echo.
echo ============================================================
echo   SUCCESS! The attendance agent is now running.
echo.
echo   It will automatically start each time you log in.
echo.
echo   To stop it: Open Task Scheduler and disable:
echo     "%TASK_NAME%"
echo.
echo   To uninstall: Run uninstall.bat
echo ============================================================
echo.
pause
