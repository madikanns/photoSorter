#!/bin/bash

echo "🚀 PhotoSorter Quick Deploy Script"
echo "=================================="
echo ""

echo "📝 Step 1: Create GitHub Repository"
echo "1. Go to https://github.com/new"
echo "2. Repository name: photoSorter"
echo "3. Description: Smart Photo Organization Tool"
echo "4. Make it Public"
echo "5. Don't initialize with README"
echo "6. Click 'Create repository'"
echo ""

echo "📋 Step 2: Copy Repository URL"
echo "After creating, copy the repository URL and run:"
echo ""

read -p "Enter your GitHub repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No repository URL provided. Please run the script again."
    exit 1
fi

echo ""
echo "🔗 Step 3: Setting up repository..."
git remote add origin $REPO_URL

echo "📤 Step 4: Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed successfully to GitHub!"
    echo ""
    echo "🚀 Step 5: Deploy on Railway"
    echo "1. Go to https://railway.app"
    echo "2. Sign in with GitHub"
    echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "4. Select your 'photoSorter' repository"
    echo "5. Railway will automatically deploy your app!"
    echo ""
    echo "🎉 Your PhotoSorter will be live at: https://your-app-name.railway.app"
    echo "📱 Access your app at: https://your-app-name.railway.app/photoSorter-simple.html"
else
    echo "❌ Error pushing to GitHub. Please check your repository URL and try again."
fi
