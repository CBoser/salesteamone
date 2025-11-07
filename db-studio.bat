@echo off
REM MindFlow Platform - Prisma Studio Launcher
REM This script opens Prisma Studio to explore the database

echo ========================================
echo  MindFlow Platform - Prisma Studio
echo ========================================
echo.

echo Starting Prisma Studio...
echo This will open in your browser at http://localhost:5555
echo.
echo Press Ctrl+C to stop Prisma Studio
echo.

cd backend
call npm run prisma:studio
