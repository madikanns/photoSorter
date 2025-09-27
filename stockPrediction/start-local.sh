#!/bin/bash

# StockPrediction Local Development Startup Script
# This script starts all necessary services for local development

set -e

echo "🚀 Starting StockPrediction Local Development Environment"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v16+${NC}"
    exit 1
fi

if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.9+${NC}"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found. Installing via Homebrew...${NC}"
    if command_exists brew; then
        brew install postgresql
    else
        echo -e "${RED}❌ Please install PostgreSQL manually${NC}"
        exit 1
    fi
fi

if ! command_exists redis-cli; then
    echo -e "${YELLOW}⚠️  Redis not found. Installing via Homebrew...${NC}"
    if command_exists brew; then
        brew install redis
    else
        echo -e "${RED}❌ Please install Redis manually${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Start PostgreSQL
echo -e "\n${BLUE}Starting PostgreSQL...${NC}"
if command_exists brew; then
    brew services start postgresql 2>/dev/null || echo "PostgreSQL already running"
else
    sudo systemctl start postgresql 2>/dev/null || echo "PostgreSQL service not available"
fi

# Start Redis
echo -e "${BLUE}Starting Redis...${NC}"
if command_exists brew; then
    brew services start redis 2>/dev/null || echo "Redis already running"
else
    sudo systemctl start redis 2>/dev/null || echo "Redis service not available"
fi

# Wait a moment for services to start
sleep 2

# Check if database exists and create if needed
echo -e "${BLUE}Setting up database...${NC}"
if ! psql -lqt | cut -d \| -f 1 | grep -qw stockprediction; then
    echo -e "${YELLOW}Creating database 'stockprediction'...${NC}"
    createdb stockprediction 2>/dev/null || echo "Database creation failed or already exists"
fi

# Setup backend
echo -e "\n${BLUE}Setting up backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit .env file with your specific settings${NC}"
fi

# Check if backend port is in use
if port_in_use 8000; then
    echo -e "${RED}❌ Port 8000 is already in use. Please stop the service using this port.${NC}"
    lsof -i:8000
    exit 1
fi

# Start backend in background
echo -e "${GREEN}Starting FastAPI backend on port 8000...${NC}"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:8000${NC}"
    echo -e "${GREEN}📚 API docs available at http://localhost:8000/docs${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Setup frontend
echo -e "\n${BLUE}Setting up frontend...${NC}"
cd ../frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENVIRONMENT=development
EOF
fi

# Check if frontend port is in use
if port_in_use 3000; then
    echo -e "${RED}❌ Port 3000 is already in use. Please stop the service using this port.${NC}"
    lsof -i:3000
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo -e "${GREEN}Starting React frontend on port 3000...${NC}"
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running at http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still be starting up...${NC}"
fi

# Success message
echo -e "\n${GREEN}🎉 StockPrediction is now running locally!${NC}"
echo -e "========================================================"
echo -e "${GREEN}📱 Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}🔧 Backend API:${NC} http://localhost:8000"
echo -e "${GREEN}📚 API Docs:${NC} http://localhost:8000/docs"
echo -e "${GREEN}❤️  Health Check:${NC} http://localhost:8000/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
