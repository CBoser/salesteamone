@echo off
REM MindFlow Platform - Project Manager (Windows)
REM This script calls the Python project manager with various options

setlocal enabledelayedexpansion

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ from python.org
    pause
    exit /b 1
)

REM If arguments provided, pass them directly to Python script
if not "%~1"=="" (
    python project_manager.py %*
    goto :end
)

REM Otherwise, show interactive menu
:menu
cls
echo ========================================
echo  MindFlow Platform - Project Manager
echo ========================================
echo.
echo  DATABASE OPERATIONS:
echo   1. Reset Database (drop + migrate + seed)
echo   2. Reset Database (no seed)
echo   3. Seed Database Only
echo   4. Open Prisma Studio
echo.
echo  DEPENDENCY MANAGEMENT:
echo   5. Clean node_modules
echo   6. Full Clean (node_modules + package-lock)
echo   7. Install Dependencies
echo.
echo  PROJECT ORGANIZATION:
echo   8. Analyze Project Structure
echo   9. Organize Documentation
echo   10. Generate Project Report
echo.
echo  COMPLETE OPERATIONS:
echo   11. Full Reset (clean + install + reset-db)
echo.
echo   0. Exit
echo.
echo ========================================

set /p choice="Enter your choice (0-11): "

if "%choice%"=="1" (
    python project_manager.py --reset-db
    pause
    goto menu
)
if "%choice%"=="2" (
    python project_manager.py --reset-db --no-seed
    pause
    goto menu
)
if "%choice%"=="3" (
    python project_manager.py --seed
    pause
    goto menu
)
if "%choice%"=="4" (
    python project_manager.py --studio
    pause
    goto menu
)
if "%choice%"=="5" (
    python project_manager.py --clean
    pause
    goto menu
)
if "%choice%"=="6" (
    python project_manager.py --clean --full
    pause
    goto menu
)
if "%choice%"=="7" (
    python project_manager.py --install
    pause
    goto menu
)
if "%choice%"=="8" (
    python project_manager.py --analyze
    pause
    goto menu
)
if "%choice%"=="9" (
    python project_manager.py --organize-docs
    pause
    goto menu
)
if "%choice%"=="10" (
    python project_manager.py --report
    pause
    goto menu
)
if "%choice%"=="11" (
    python project_manager.py --all
    pause
    goto menu
)
if "%choice%"=="0" (
    goto end
)

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:end
endlocal
