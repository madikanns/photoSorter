# 🔍 Debug Auto-Deploy Issues

## 🚨 **Problem**: Auto-deploy setting is ON but not working

## 🔍 **Common Causes & Solutions**:

### **1. GitHub Webhook Issues**
- **Check**: GitHub repository → Settings → Webhooks
- **Look for**: Render webhook (should be active)
- **Fix**: If missing, reconnect GitHub in Render

### **2. Repository Connection Issues**
- **Check**: Render dashboard → Service settings
- **Look for**: "Connected to GitHub" status
- **Fix**: Disconnect and reconnect GitHub

### **3. Branch Configuration**
- **Check**: Render settings → Auto-deploy
- **Look for**: Branch set to `main` (not `master`)
- **Fix**: Change branch to `main` if needed

### **4. Repository Permissions**
- **Check**: GitHub repository is public OR Render has access
- **Fix**: Make repository public or grant Render access

### **5. Webhook Payload Issues**
- **Check**: Webhook delivery logs in GitHub
- **Look for**: Failed deliveries or 404 errors
- **Fix**: Update webhook URL if needed

## 🛠️ **Step-by-Step Fix**:

### **Step 1: Check Render Dashboard**
1. Go to https://dashboard.render.com
2. Find your `photosorter` service
3. Check if it shows "Connected to GitHub"
4. Look for any error messages

### **Step 2: Reconnect GitHub**
1. In Render dashboard, go to **Settings**
2. Find **GitHub** section
3. Click **Disconnect** (if connected)
4. Click **Connect GitHub**
5. Select repository: `madikanns/photoSorter`
6. Make sure **Auto-deploy** is checked

### **Step 3: Check GitHub Webhooks**
1. Go to https://github.com/madikanns/photoSorter/settings/hooks
2. Look for Render webhook
3. Check if it's active and delivering

### **Step 4: Test Auto-Deploy**
1. Make a small change to any file
2. Commit and push to GitHub
3. Check if Render detects the change

## 🚀 **Alternative: Manual Deploy**

If auto-deploy still doesn't work:
1. **Manual Deploy**: In Render dashboard, click "Manual Deploy"
2. **Select**: "Deploy latest commit"
3. **Wait**: For deployment to complete

## 📋 **Quick Test Commands**:

```bash
# Test auto-deploy
echo "Test auto-deploy $(date)" > test-deploy.txt
git add test-deploy.txt
git commit -m "Test auto-deploy"
git push origin main
```

## 🔍 **Expected Behavior**:
- ✅ Render should detect changes within 1-2 minutes
- ✅ Build should start automatically
- ✅ App should update with new changes

---
**Status**: 🔍 Debugging Auto-Deploy
**Last Updated**: $(date)
