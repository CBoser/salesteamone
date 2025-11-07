@echo off
REM MindFlow Platform - Database Reset Script
REM WARNING: This will delete all data!

echo ========================================
echo  MindFlow Platform - Database Reset
echo ========================================
echo.
echo WARNING: This will DELETE ALL DATA in the database!
echo.
set /p confirm="Are you sure you want to continue? (yes/no): "
if /i not "%confirm%"=="yes" (
    echo Operation cancelled.
    pause
    exit /b 0
)
echo.

echo [1/3] Stopping database...
docker compose down
timeout /t 2 /nobreak >nul
echo.

echo [2/3] Deleting database volume...
docker volume rm salesteamone_postgres_data 2>nul
echo.

echo [3/3] Restarting database and running migrations...
docker compose up -d
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul
echo.

cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
call npm run prisma:migrate
cd ..

echo.
echo ========================================
echo  Database reset complete!
echo ========================================
echo.
echo The database has been reset to a clean state.
echo You may want to run seed data next (when available).
echo.
pause
