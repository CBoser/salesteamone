@echo off
REM MindFlow Platform - Database Reset Script
REM This script completely resets the database to fix authentication issues

echo ============================================================
echo  MindFlow Platform - Database Reset
echo ============================================================
echo.
echo This script will:
echo   1. Stop the PostgreSQL container
echo   2. Remove the old database volume (fixes credential issues)
echo   3. Start a fresh PostgreSQL instance
echo   4. Run migrations
echo   5. (Optional) Seed sample data
echo.
echo WARNING: This will DELETE ALL DATA in the database!
echo.
pause

echo.
echo [1/5] Stopping database...
docker compose down
if %errorlevel% neq 0 (
    echo ERROR: Failed to stop containers
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)
echo ✓ Database stopped
echo.

echo [2/5] Removing old database volume...
echo This fixes authentication errors from old credentials.
docker volume rm constructionplatform_postgres_data 2>nul
echo ✓ Volume removed (or didn't exist)
echo.

echo [3/5] Starting fresh PostgreSQL instance...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start PostgreSQL
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)
echo ✓ PostgreSQL started with fresh credentials
echo.

echo [4/5] Waiting for database to initialize...
echo (This takes about 15 seconds)
timeout /t 15 /nobreak >nul
echo ✓ Database ready
echo.

echo [5/5] Running database migrations...
cd backend
call npm run prisma:generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma client generation failed
    cd ..
    pause
    exit /b 1
)

call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo ERROR: Database migrations failed
    echo.
    echo If you see authentication errors, the database may need more time.
    echo Try running this script again in 10 seconds.
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Migrations completed
echo.

echo ============================================================
echo  Database Reset Complete!
echo ============================================================
echo.
echo Next steps:
echo   1. (Optional) Seed sample data: cd backend ^&^& npm run prisma:seed
echo   2. Start the development servers: launch.bat
echo   3. View database: db-studio.bat
echo.
pause
