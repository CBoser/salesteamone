@echo off
echo ========================================
echo  Fixing Auth TypeScript Errors
echo ========================================
echo.

set AUTH_FILE=backend\src\services\auth.ts

echo Checking if %AUTH_FILE% exists...
if not exist "%AUTH_FILE%" (
    echo ERROR: File not found: %AUTH_FILE%
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo File found! Applying fixes...
echo.

REM Use PowerShell to fix the file
powershell -Command "(Get-Content '%AUTH_FILE%') -replace 'expiresIn: JWT_EXPIRES_IN,', 'expiresIn: JWT_EXPIRES_IN as string,' | Set-Content '%AUTH_FILE%'"
powershell -Command "(Get-Content '%AUTH_FILE%') -replace 'expiresIn: JWT_REFRESH_EXPIRES_IN,', 'expiresIn: JWT_REFRESH_EXPIRES_IN as string,' | Set-Content '%AUTH_FILE%'"

echo.
echo ========================================
echo  Fix Applied Successfully!
echo ========================================
echo.
echo Changes made:
echo   Line 55: Added 'as string' to JWT_EXPIRES_IN
echo   Line 59: Added 'as string' to JWT_REFRESH_EXPIRES_IN
echo.
echo Nodemon should auto-restart the backend now.
echo If not, press Ctrl+C in your terminal and restart launch.bat
echo.
pause
