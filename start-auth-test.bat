@echo off
REM Quick Start Script for Testing Authentication (Windows)
REM This script starts backend and dashboard services

echo.
echo ========================================
echo   Corpus AI Authentication Test
echo ========================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed. Please install it first:
    echo npm install -g pnpm
    pause
    exit /b 1
)

echo [OK] pnpm found
echo.

REM Change to script directory
cd /d "%~dp0"

echo Starting Backend (port 8001)...
start "Corpus AI Backend" cmd /k "pnpm dev --filter=backend"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo Starting Dashboard (port 8080)...
start "Corpus AI Dashboard" cmd /k "pnpm dev --filter=dashboard"

REM Wait for dashboard to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo Dashboard:  http://localhost:8080
echo Backend:    http://localhost:8001
echo Sign Up:    http://localhost:8080/signup
echo Sign In:    http://localhost:8080/signin
echo.
echo ========================================
echo.
echo Test Credentials:
echo   Email: test@example.com
echo   Password: TestPass123!
echo.
echo Press any key to open browser...
pause >nul

REM Open browser
start http://localhost:8080

echo.
echo Services are running in separate windows.
echo Close those windows to stop the services.
echo.
pause
