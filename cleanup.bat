@echo off
REM MindFlow Platform - Cleanup Script for Windows
REM This script removes node_modules to fix locked file issues

echo ========================================
echo  MindFlow Platform - Cleanup
echo ========================================
echo.
echo This will DELETE all node_modules folders
echo to fix locked file or corrupted dependency issues.
echo.
echo You will need to run setup.bat again after cleanup.
echo.
set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cleanup cancelled.
    pause
    exit /b 0
)
echo.

echo Cleaning up node_modules folders...
echo.

REM Stop any running processes that might lock files
echo Stopping development servers if running...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.

REM Clean root node_modules
if exist node_modules (
    echo Removing root node_modules...
    rmdir /s /q node_modules 2>nul
    if exist node_modules (
        echo WARNING: Could not remove root node_modules
        echo Try closing all IDEs/terminals and run this script again
    ) else (
        echo ✓ Root node_modules removed
    )
) else (
    echo ✓ Root node_modules not found (already clean)
)
echo.

REM Clean frontend node_modules
if exist frontend\node_modules (
    echo Removing frontend\node_modules...
    rmdir /s /q frontend\node_modules 2>nul
    if exist frontend\node_modules (
        echo WARNING: Could not remove frontend\node_modules
        echo Try closing all IDEs/terminals and run this script again
    ) else (
        echo ✓ Frontend node_modules removed
    )
) else (
    echo ✓ Frontend node_modules not found (already clean)
)
echo.

REM Clean backend node_modules
if exist backend\node_modules (
    echo Removing backend\node_modules...
    rmdir /s /q backend\node_modules 2>nul
    if exist backend\node_modules (
        echo WARNING: Could not remove backend\node_modules
        echo Try closing all IDEs/terminals and run this script again
    ) else (
        echo ✓ Backend node_modules removed
    )
) else (
    echo ✓ Backend node_modules not found (already clean)
)
echo.

REM Clean package-lock files
echo Removing package-lock.json files...
if exist package-lock.json del /f /q package-lock.json 2>nul
if exist frontend\package-lock.json del /f /q frontend\package-lock.json 2>nul
if exist backend\package-lock.json del /f /q backend\package-lock.json 2>nul
echo ✓ Package-lock files removed
echo.

echo ========================================
echo  Cleanup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run 'setup.bat' to reinstall dependencies
echo   2. If you still have locked file errors:
echo      - Close ALL IDEs and terminals
echo      - Restart your computer
echo      - Run this cleanup script again
echo      - Run setup.bat
echo.
echo Tips to avoid this issue:
echo   - Always close VSCode/IDEs before running setup
echo   - Don't delete node_modules manually while servers run
echo   - Use 'stop.bat' before running setup again
echo.
pause
