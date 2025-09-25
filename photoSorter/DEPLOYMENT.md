# PhotoSorter Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Railway (Recommended - Like medicalApp)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `photoSorter` folder
   - Railway will automatically detect the configuration
   - Your app will be available at: `https://your-app-name.railway.app`

### Option 2: Render (Alternative)

1. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"
   - Use the `render.yaml` configuration
   - Your app will be available at: `https://your-app-name.onrender.com`

### Option 3: Vercel (Static Hosting)

1. **Deploy on Vercel:**
   ```bash
   npm install -g vercel
   cd frontend/public
   vercel --prod
   ```

## 📁 Deployment Structure

```
photoSorter/
├── frontend/
│   ├── public/
│   │   ├── photoSorter-simple.html    # Main web app
│   │   └── gps-extractor.py           # GPS server
│   └── package.json
├── requirements.txt                   # Python dependencies
├── railway.json                      # Railway config
├── render.yaml                       # Render config
├── nixpacks.toml                     # Nixpacks config
└── deploy.sh                         # Deployment script
```

## 🔧 Environment Variables

Set these in your deployment platform:

- `PORT`: Server port (usually set automatically)
- `NODE_ENV`: production
- `PYTHON_VERSION`: 3.9.18

## 📱 Access Your Deployed App

Once deployed, your PhotoSorter will be available at:
- **Railway**: `https://your-app-name.railway.app/photoSorter-simple.html`
- **Render**: `https://your-app-name.onrender.com/photoSorter-simple.html`
- **Vercel**: `https://your-app-name.vercel.app/photoSorter-simple.html`

## 🛠️ Local Development

To run locally:

```bash
# Start GPS server
cd frontend/public
python3 gps-extractor.py 8088 &

# Start web server
python3 -m http.server 8087

# Access at: http://localhost:8087/photoSorter-simple.html
```

## 📝 Notes

- **GPS Functionality**: Full GPS extraction requires `exiftool` which may not be available in cloud environments
- **File System Access**: Some features may be limited in cloud deployment
- **Desktop Version**: For full functionality, use the Electron desktop version

## 🔄 Updates

To update your deployed app:
1. Make changes to your code
2. Commit and push to GitHub
3. Your deployment platform will automatically rebuild and deploy
