# 🚀 PhotoSorter Auto-Deployment Guide

## ✅ **Current Status: DEPLOYED**
- **Live URL**: https://photosorter.onrender.com
- **Repository**: https://github.com/madikanns/photoSorter
- **Auto-Deploy**: ✅ Enabled

## 🔄 **Automatic Deployment Setup**

### **Method 1: Using the Auto-Deploy Script (Recommended)**
```bash
# Run this command whenever you want to deploy changes
./auto-deploy.sh
```

### **Method 2: Manual Git Push (Also Auto-Deploys)**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 🎯 **How Auto-Deployment Works**

1. **Push to GitHub** → Render detects changes automatically
2. **Render builds** → Installs dependencies and builds frontend
3. **Render deploys** → Updates the live application
4. **Ready to use** → Available at https://photosorter.onrender.com

## 📋 **Deployment Checklist**

### **✅ Render Configuration**
- [x] Service connected to GitHub repository
- [x] Auto-deploy enabled on push to main branch
- [x] Build command configured
- [x] Start command configured
- [x] Health check path set

### **✅ GitHub Integration**
- [x] Repository: https://github.com/madikanns/photoSorter
- [x] Main branch: `main`
- [x] Webhook configured for Render

## 🛠️ **Troubleshooting**

### **If Auto-Deploy Doesn't Work:**

1. **Check Render Dashboard**
   - Go to https://dashboard.render.com
   - Find your `photosorter` service
   - Check deployment logs

2. **Manual Deploy**
   - In Render dashboard, click "Manual Deploy"
   - Or use the auto-deploy script: `./auto-deploy.sh`

3. **Check GitHub Webhook**
   - Go to GitHub repository settings
   - Check webhooks section
   - Ensure Render webhook is active

## 🚀 **Quick Deploy Commands**

```bash
# Quick deploy with auto-deploy script
./auto-deploy.sh

# Or manual git push (also triggers auto-deploy)
git add . && git commit -m "Update" && git push origin main
```

## 📱 **Testing Your Deployment**

1. **Wait 2-3 minutes** after pushing changes
2. **Visit**: https://photosorter.onrender.com
3. **Test folder selection** - should work better now
4. **Test individual file selection** - fallback option

## 🔧 **Current Features**

- ✅ **Folder Selection**: Works in Chrome/Edge, fallback for other browsers
- ✅ **Individual File Selection**: Works in all browsers
- ✅ **GPS Location Detection**: Server-side processing
- ✅ **Year/Month Organization**: Automatic folder structure
- ✅ **Location-based Folders**: GPS coordinates to location names
- ✅ **Cross-browser Compatibility**: Works everywhere

## 📞 **Support**

If you encounter issues:
1. Check the deployment logs in Render dashboard
2. Test the application at https://photosorter.onrender.com
3. Use the individual file selection if folder selection doesn't work

---
**Last Updated**: $(date)
**Status**: ✅ Auto-Deploy Active
