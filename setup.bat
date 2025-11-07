@echo off
REM MindFlow Platform - Initial Setup Script for Windows
REM This script sets up the development environment

echo ========================================
echo  MindFlow Platform - Initial Setup
echo ========================================
echo.

REM Check Node.js
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found
echo.

REM Check Docker
echo [2/6] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed!
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✓ Docker found
echo.

REM Setup environment files
echo [3/7] Setting up environment files...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo ✓ Created backend\.env from .env.example
    ) else (
        echo WARNING: backend\.env.example not found
    )
) else (
    echo ✓ backend\.env already exists
)

if not exist "frontend\.env" (
    if exist "frontend\.env.example" (
        copy "frontend\.env.example" "frontend\.env" >nul
        echo ✓ Created frontend\.env from .env.example
    ) else (
        echo ✓ frontend\.env.example not found (optional)
    )
) else (
    echo ✓ frontend\.env already exists
)
echo.

REM Install dependencies
echo [4/7] Installing dependencies...
echo This may take a few minutes...
echo.

echo Installing root dependencies (concurrently)...
call npm install --no-save concurrently
if %errorlevel% neq 0 (
    echo WARNING: Failed to install root dependencies
    echo You may need to close IDEs/terminals and try again
)
echo.

echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install frontend dependencies
    echo.
    echo Common Windows fixes:
    echo   1. Close all IDEs and terminals
    echo   2. Delete frontend\node_modules folder manually
    echo   3. Run: rmdir /s /q frontend\node_modules
    echo   4. Try setup again
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install backend dependencies
    echo.
    echo Common Windows fixes:
    echo   1. Close all IDEs and terminals
    echo   2. Delete backend\node_modules folder manually
    echo   3. Run: rmdir /s /q backend\node_modules
    echo   4. Try setup again
    echo.
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Backend dependencies installed
echo.

REM Start PostgreSQL
echo [5/7] Starting PostgreSQL database...
echo.
echo Stopping any existing database containers...
docker compose down 2>nul
echo.
echo Removing old database volume (if exists)...
echo This ensures fresh credentials are used.
docker volume rm constructionplatform_postgres_data 2>nul
echo.
echo Starting fresh PostgreSQL instance...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start PostgreSQL
    echo Make sure Docker Desktop is running
    pause
    exit /b 1
)
echo ✓ PostgreSQL started
echo.

REM Wait for database to be ready
echo Waiting for database to be ready...
echo (This takes about 15 seconds for PostgreSQL to fully initialize)
timeout /t 15 /nobreak >nul
echo.

REM Generate Prisma Client
echo [6/7] Generating Prisma Client...
cd backend
set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
call npx prisma generate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Prisma client generation failed!
    echo.
    echo This is required for the backend to start.
    echo Please try running manually:
    echo   cd backend
    echo   set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
    echo   npx prisma generate
    echo.
    cd ..
    pause
    exit /b 1
)
echo ✓ Prisma Client generated successfully
cd ..
echo.

REM Run database migrations
echo [7/7] Running database migrations...
echo (Creating database schema from prisma/schema.prisma)
cd backend
call npm run prisma:migrate
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database migrations failed!
    echo.
    echo Possible causes:
    echo   1. Database not ready yet (try again in 10 seconds)
    echo   2. Database connection issue (check docker compose logs postgres)
    echo   3. Schema errors (check backend/prisma/schema.prisma)
    echo.
    echo To retry manually:
    echo   cd backend
    echo   npm run prisma:migrate
    echo.
    echo You can still use the app, but database tables won't exist.
    echo.
    cd ..
    pause
    goto :complete
)
echo ✓ Database migrations completed successfully
cd ..
echo.

:complete
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run 'launch.bat' to start the development servers
echo   2. Frontend will be at: http://localhost:5173
echo   3. Backend will be at: http://localhost:3001
echo   4. Prisma Studio: cd backend ^&^& npm run prisma:studio
echo.
echo Useful commands:
echo   - View database: cd backend ^&^& npm run prisma:studio
echo   - Stop servers: Press Ctrl+C in the launch window
echo   - Stop database: docker compose down
echo.
pause
