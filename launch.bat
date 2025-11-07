@echo off
REM MindFlow Platform - Launch Script for Windows
REM This script starts the development environment

echo ========================================
echo  MindFlow Platform - Development Launch
echo ========================================
echo.

REM Check if Docker is running
echo [1/3] Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✓ Docker is running
echo.

REM Check if PostgreSQL container is running
echo [2/3] Checking PostgreSQL status...
docker ps --filter "name=mindflow-postgres" --format "{{.Names}}" | findstr mindflow-postgres >nul
if %errorlevel% neq 0 (
    echo PostgreSQL container not running. Starting...
    docker compose up -d
    echo Waiting for database to be ready...
    timeout /t 5 /nobreak >nul
    echo ✓ PostgreSQL started
) else (
    echo ✓ PostgreSQL is already running
)
echo.

REM Start development servers
echo [3/3] Starting development servers...
echo.
echo ========================================
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo  Health:   http://localhost:3001/health
echo ========================================
echo.
echo Press Ctrl+C to stop all servers
echo.

call npm run dev
