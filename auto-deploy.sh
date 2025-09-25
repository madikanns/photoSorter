#!/bin/bash

# Auto-deploy script for PhotoSorter
# This script ensures automatic deployment to Render

echo "🚀 PhotoSorter Auto-Deploy Script"
echo "================================="

# Check if we're in the right directory
if [ ! -f "photoSorter-simple.html" ]; then
    echo "❌ Error: photoSorter-simple.html not found. Please run from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ Error: No remote origin set. Please add your GitHub repository."
    echo "Run: git remote add origin https://github.com/madikanns/photoSorter.git"
    exit 1
fi

echo "✅ Git repository configured"

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub"
echo "🔄 Render should automatically detect changes and redeploy"
echo "🌐 Your app will be available at: https://photosorter.onrender.com"
echo ""
echo "📋 Next steps:"
echo "1. Wait 2-3 minutes for Render to detect the changes"
echo "2. Check your Render dashboard for deployment status"
echo "3. Visit https://photosorter.onrender.com to test the updated app"
