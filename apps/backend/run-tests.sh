#!/bin/bash

# Test runner script for Corpus AI Backend
# This script starts the server in background and runs all tests

echo "==================================="
echo "Corpus AI Backend Test Runner"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create .env file with required credentials"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
pnpm install --silent

echo ""
echo -e "${YELLOW}Step 2: Starting backend server in background...${NC}"
# Start server in background and capture PID
pnpm dev > server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to be ready..."
sleep 5

# Check if server is running
if ! curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${RED}Warning: Server health check failed${NC}"
    echo "Server logs:"
    tail -20 server.log
    echo ""
    echo "Continuing with tests anyway..."
else
    echo -e "${GREEN}✓ Server is running!${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Running tests...${NC}"
echo "=================================="
echo ""

# Run tests
pnpm test --verbose

TEST_EXIT_CODE=$?

echo ""
echo "=================================="
echo -e "${YELLOW}Step 4: Cleaning up...${NC}"

# Kill the server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo -e "${GREEN}✓ Server stopped${NC}"

# Show test results
echo ""
echo "==================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Check the output above for details"
    echo "Server logs are in: server.log"
fi
echo "==================================="

exit $TEST_EXIT_CODE
