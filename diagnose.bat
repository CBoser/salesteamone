@echo off
REM MindFlow Platform - Backend Diagnostic Script
echo ========================================
echo  MindFlow Backend Diagnostics
echo ========================================
echo.

echo [1/5] Checking if backend is running...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend is responding
    echo.
    echo Backend Response:
    curl -s http://localhost:3001/health
    echo.
    echo.
) else (
    echo ✗ Backend is NOT responding on port 3001
    echo.
)

echo [2/5] Checking if port 3001 is in use...
netstat -ano | findstr :3001 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Port 3001 is in use
    echo.
    netstat -ano | findstr :3001 | findstr LISTENING
    echo.
) else (
    echo ✗ Port 3001 is NOT in use
    echo   Backend server is not running!
    echo.
)

echo [3/5] Checking PostgreSQL status...
docker ps --filter "name=mindflow-postgres" --format "{{.Status}}" | findstr Up >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is running
) else (
    echo ✗ PostgreSQL is NOT running
    echo   Run: docker compose up -d
)
echo.

echo [4/5] Checking Prisma Client...
if exist "backend\node_modules\.prisma\client\index.js" (
    echo ✓ Prisma Client exists
) else (
    echo ✗ Prisma Client NOT found
    echo   Run: prisma-setup.bat
)
echo.

echo [5/5] Testing backend API endpoint...
curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend API is accessible
    echo.
    echo Test Response:
    curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
    echo.
) else (
    echo ✗ Backend API is NOT accessible
)
echo.

echo ========================================
echo  Diagnostic Summary
echo ========================================
echo.
echo If backend is not responding:
echo   1. Check the launch.bat window for error messages
echo   2. Look for red text showing errors
echo   3. Try stopping (Ctrl+C) and running launch.bat again
echo.
echo If "Prisma Client not initialized" error:
echo   1. Stop servers (Ctrl+C)
echo   2. Run: prisma-setup.bat
echo   3. Run: launch.bat
echo.
echo If database errors:
echo   1. Check: docker compose logs postgres
echo   2. Restart: docker compose restart
echo.
pause
