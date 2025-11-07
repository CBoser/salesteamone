@echo off
REM Fix Tailwind CSS v4 PostCSS Configuration
echo ========================================
echo  Fixing Tailwind CSS PostCSS Setup
echo ========================================
echo.

echo Installing @tailwindcss/postcss package...
cd frontend
call npm install -D @tailwindcss/postcss
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install @tailwindcss/postcss
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ @tailwindcss/postcss installed
echo.

echo ========================================
echo  Fix Complete!
echo ========================================
echo.
echo Tailwind CSS v4 is now configured correctly.
echo PostCSS will use @tailwindcss/postcss plugin.
echo.
echo Next step: Run launch.bat to start servers
echo.
pause
