#!/bin/bash

# MindFlow Platform Launch Script
# This script starts the development environment

set -e

echo "================================"
echo "  MindFlow Platform Launcher"
echo "================================"
echo ""

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker to run the PostgreSQL database"
    echo "See LAUNCH_GUIDE.md for installation instructions"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Start PostgreSQL database
echo "Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Check if Prisma client is generated
if [ ! -d "backend/node_modules/.prisma/client" ]; then
    echo "Generating Prisma client..."
    cd backend
    npm run prisma:generate
    cd ..
fi

# Check if migrations have been run
echo "Running database migrations..."
cd backend
npm run prisma:migrate || echo "⚠️  Migrations may have already been run"
cd ..

# Start the application
echo ""
echo "================================"
echo "  Launching Application"
echo "================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

npm run dev
