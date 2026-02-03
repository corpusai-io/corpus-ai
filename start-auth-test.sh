#!/bin/bash

# Quick Start Script for Testing Authentication
# This script starts backend and dashboard services

echo "🚀 Starting Corpus AI Authentication Test..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Starting services...${NC}"
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed. Please install it first:${NC}"
    echo "npm install -g pnpm"
    exit 1
fi

echo -e "${GREEN}✓ pnpm found${NC}"
echo ""

# Start backend in background
echo -e "${BLUE}🔧 Starting Backend (port 8001)...${NC}"
cd "$(dirname "$0")"
pnpm dev --filter=backend &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start dashboard in background
echo -e "${BLUE}🎨 Starting Dashboard (port 8080)...${NC}"
pnpm dev --filter=dashboard &
DASHBOARD_PID=$!

# Wait for services to start
sleep 5

echo ""
echo -e "${GREEN}✅ Services started!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Authentication Test Ready!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📍 Dashboard:${NC}  http://localhost:8080"
echo -e "${YELLOW}📍 Backend:${NC}    http://localhost:8001"
echo -e "${YELLOW}📍 Sign Up:${NC}    http://localhost:8080/signup"
echo -e "${YELLOW}📍 Sign In:${NC}    http://localhost:8080/signin"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Test Credentials:${NC}"
echo "  Email: test@example.com"
echo "  Password: TestPass123!"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $DASHBOARD_PID 2>/dev/null
    echo -e "${GREEN}✓ Services stopped${NC}"
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT

# Wait for processes
wait
