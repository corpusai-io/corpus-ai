@echo off
REM Test runner script for Corpus AI Backend (Windows)
REM This script starts the server in background and runs all tests

echo ===================================
echo Corpus AI Backend Test Runner
echo ===================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Error: .env file not found!
    echo Please create .env file with required credentials
    exit /b 1
)

echo Step 1: Installing dependencies...
call pnpm install --silent

echo.
echo Step 2: Starting backend server in background...
start /B cmd /c "pnpm dev > server.log 2>&1"

REM Wait for server to start
echo Waiting for server to be ready...
timeout /t 5 /nobreak >nul

REM Check if server is running
curl -s http://localhost:8001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Server health check failed
    echo Server logs:
    type server.log
    echo.
    echo Continuing with tests anyway...
) else (
    echo OK Server is running!
)

echo.
echo Step 3: Running tests...
echo ==================================
echo.

REM Run tests
call pnpm test --verbose

set TEST_EXIT_CODE=%errorlevel%

echo.
echo ==================================
echo Step 4: Cleaning up...

REM Kill the server
taskkill /F /IM node.exe /FI "WINDOWTITLE eq pnpm*" >nul 2>&1

echo OK Server stopped

REM Show test results
echo.
echo ===================================
if %TEST_EXIT_CODE% equ 0 (
    echo OK ALL TESTS PASSED!
) else (
    echo X SOME TESTS FAILED
    echo.
    echo Check the output above for details
    echo Server logs are in: server.log
)
echo ===================================

exit /b %TEST_EXIT_CODE%
