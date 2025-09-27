#!/bin/bash

# StockPrediction Quick Start Script
# This script provides a simple way to start the StockPrediction application locally

set -e

echo "🚀 StockPrediction Quick Start"
echo "=============================="

# Check if we're in the right directory
if [ ! -d "stockPrediction" ]; then
    echo "❌ Please run this script from the madikanns directory"
    exit 1
fi

cd stockPrediction

echo "📁 Current directory: $(pwd)"

# Check if start-local.sh exists and is executable
if [ -f "start-local.sh" ] && [ -x "start-local.sh" ]; then
    echo "✅ Found start-local.sh script"
    echo "🚀 Starting StockPrediction..."
    ./start-local.sh
else
    echo "❌ start-local.sh not found or not executable"
    echo "Please run: chmod +x start-local.sh"
    exit 1
fi
