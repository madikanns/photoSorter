# 🔧 Render Setup Guide for PhotoSorter

## ✅ **Goal**: Make PhotoSorter auto-deploy work like MedicalApp

## 📋 **Step-by-Step Setup**:

### **Step 1: Create New Render Service**
1. Go to https://dashboard.render.com
2. Click **"New +"** button
3. Select **"Web Service"**
4. Connect to GitHub repository: `madikanns/photoSorter`

### **Step 2: Configure Service Settings**
```
Name: photosorter
Environment: Python
Build Command: pip install -r requirements.txt && cd frontend && npm install && npm run build && cp -r build/* public/
Start Command: cd frontend/public && python3 -m http.server $PORT
```

### **Step 3: Enable Auto-Deploy**
1. In service settings, find **"Auto-Deploy"**
2. Make sure it's **ENABLED**
3. Set **Branch** to `main`
4. Save settings

### **Step 4: Environment Variables**
```
PYTHON_VERSION=3.9.18
NODE_VERSION=18
CI=false
GENERATE_SOURCEMAP=false
```

### **Step 5: Health Check**
- **Health Check Path**: `/photoSorter-simple.html`

## 🔍 **Troubleshooting**:

### **If Auto-Deploy Still Doesn't Work**:
1. **Check GitHub Connection**: Ensure Render can access your repo
2. **Check Webhooks**: Go to GitHub repo settings → Webhooks
3. **Check Render Logs**: Look for error messages
4. **Manual Deploy**: Test with manual deploy first

### **Common Issues**:
- **Repository not found**: Make sure repo is public or Render has access
- **Build fails**: Check build command syntax
- **Start fails**: Check start command and file paths

## 📱 **Test Auto-Deploy**:

1. **Make a small change** to any file
2. **Commit and push** to GitHub
3. **Check Render dashboard** for deployment status
4. **Visit your app** to verify changes

## 🎯 **Expected Result**:

- ✅ Auto-deploy triggers on every push to `main`
- ✅ Build completes successfully
- ✅ App updates automatically
- ✅ Available at your Render URL

---
**Status**: 🔧 Configuring Render for PhotoSorter
**Reference**: MedicalApp (working auto-deploy)
