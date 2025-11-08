#!/bin/bash

# MindFlow Platform Stop Script
# Stops all running services

echo "Stopping MindFlow Platform..."

# Stop Docker containers
echo "Stopping PostgreSQL database..."
docker-compose down

echo ""
echo "✅ All services stopped"
echo ""
echo "To restart, run: ./launch.sh"
