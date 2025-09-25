#!/bin/bash

# Quick Deploy Script for PhotoSorter
# Simplified deployment without complex build process

echo "🚀 PhotoSorter Quick Deploy"
echo "============================"

# Check if we're in the right directory
if [ ! -f "photoSorter-simple.html" ]; then
    echo "❌ Error: photoSorter-simple.html not found. Please run from the project root."
    exit 1
fi

echo "✅ Files found - ready to deploy"

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Quick deploy: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub"
echo "🔄 Render should deploy much faster now (simplified build)"
echo "🌐 Your app will be available at: https://photosorter.onrender.com"
echo ""
echo "⏱️  Expected deployment time: 2-3 minutes (much faster!)"
echo "📋 Check Render dashboard for deployment status"
