@echo off
REM MindFlow Platform - Stop Script for Windows
REM This script stops all running services

echo ========================================
echo  MindFlow Platform - Stopping Services
echo ========================================
echo.

echo [1/2] Stopping development servers...
echo Press Ctrl+C in the launch window if servers are still running
echo.

echo [2/2] Stopping PostgreSQL database...
docker compose down
if %errorlevel% neq 0 (
    echo WARNING: Failed to stop PostgreSQL
    echo You may need to stop it manually via Docker Desktop
) else (
    echo ✓ PostgreSQL stopped
)
echo.

echo ========================================
echo  All services stopped
echo ========================================
echo.
pause
