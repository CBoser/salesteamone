@echo off
REM MindFlow Platform - Status Check Script for Windows
REM This script checks the status of all services

echo ========================================
echo  MindFlow Platform - Status Check
echo ========================================
echo.

REM Check Node.js
echo [Node.js]
node --version 2>nul
if %errorlevel% neq 0 (
    echo ✗ Not installed
) else (
    echo ✓ Installed
)
echo.

REM Check Docker
echo [Docker]
docker --version 2>nul
if %errorlevel% neq 0 (
    echo ✗ Not installed
) else (
    echo ✓ Installed
    docker ps >nul 2>&1
    if %errorlevel% neq 0 (
        echo ✗ Not running
    ) else (
        echo ✓ Running
    )
)
echo.

REM Check PostgreSQL container
echo [PostgreSQL Container]
docker ps --filter "name=mindflow-postgres" --format "{{.Names}}" 2>nul | findstr mindflow-postgres >nul
if %errorlevel% neq 0 (
    echo ✗ Not running
) else (
    echo ✓ Running
    docker ps --filter "name=mindflow-postgres" --format "{{.Status}}"
)
echo.

REM Check if frontend is running
echo [Frontend Server (Port 5173)]
netstat -an | findstr ":5173" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Not running
) else (
    echo ✓ Running
)
echo.

REM Check if backend is running
echo [Backend Server (Port 3001)]
netstat -an | findstr ":3001" >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Not running
) else (
    echo ✓ Running
)
echo.

REM Try to hit the health endpoint
echo [Backend Health Check]
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Backend not responding
) else (
    echo ✓ Backend healthy
    curl -s http://localhost:3001/health
)
echo.

echo ========================================
echo  Status check complete
echo ========================================
echo.
pause
