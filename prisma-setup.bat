@echo off
REM MindFlow Platform - Prisma Setup Script for Windows
REM This script generates Prisma Client and runs migrations

echo ========================================
echo  MindFlow Platform - Prisma Setup
echo ========================================
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this from the project root directory.
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
echo [1/3] Checking PostgreSQL...
docker ps --filter "name=mindflow-postgres" --format "{{.Names}}" | findstr mindflow-postgres >nul
if %errorlevel% neq 0 (
    echo PostgreSQL container not running. Starting...
    docker compose up -d
    echo Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
    echo ✓ PostgreSQL started
) else (
    echo ✓ PostgreSQL is already running
)
echo.

REM Generate Prisma Client
echo [2/3] Generating Prisma Client...
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Prisma client generation failed!
    echo.
    echo Please check:
    echo   1. Node.js is installed (node --version)
    echo   2. Dependencies are installed (npm install in backend/)
    echo   3. Prisma schema is valid (backend/prisma/schema.prisma)
    echo.
    cd ..
    pause
    exit /b 1
)
echo ✓ Prisma Client generated successfully
cd ..
echo.

REM Run database migrations
echo [3/3] Running database migrations...
cd backend
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database migrations failed!
    echo.
    echo Possible causes:
    echo   1. Database not ready yet (wait and try again)
    echo   2. Database connection issue (check DATABASE_URL in backend/.env)
    echo   3. Schema errors (check backend/prisma/schema.prisma)
    echo.
    echo View database logs:
    echo   docker compose logs postgres
    echo.
    cd ..
    pause
    exit /b 1
)
echo ✓ Database migrations completed successfully
cd ..
echo.

echo ========================================
echo  Prisma Setup Complete!
echo ========================================
echo.
echo You can now:
echo   1. Run 'launch.bat' to start development servers
echo   2. Run 'db-studio.bat' to view database
echo.
pause
