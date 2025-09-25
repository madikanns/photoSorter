# photoSorter - Hybrid Version

photoSorter now supports both **Desktop (Electron)** and **Web** versions, giving you the flexibility to organize photos from local folders or Google Drive.

## 🚀 Features

### Desktop Version (Electron)
- ✅ **Local File Access**: Browse and organize photos from your computer
- ✅ **Recursive Search**: Finds photos in all subfolders
- ✅ **Year-based Organization**: Creates folders by year (2021, 2022, etc.)
- ✅ **Copy Photos**: Preserves original photos while creating organized copies
- ✅ **Real-time Progress**: Shows progress as photos are processed

### Web Version (Browser)
- ✅ **Google Drive Integration**: Access and organize photos from Google Drive
- ✅ **Cloud Organization**: Create folders directly in Google Drive
- ✅ **Cross-platform**: Works on any device with a web browser
- ✅ **No Installation**: Just open in your browser

## 📦 Installation & Setup

### For Desktop Version (Electron)

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run the Application**:
   ```bash
   # Start React development server
   npm start
   
   # In another terminal, start Electron
   npm run electron
   ```

### For Web Version (Google Drive)

1. **Setup Google Drive API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Drive API
   - Create credentials (API Key and OAuth 2.0 Client ID)
   - Copy `.env.example` to `.env` and add your credentials

2. **Run Web Version**:
   ```bash
   cd frontend
   npm start
   ```
   - Open http://localhost:3000 in your browser
   - The app will automatically detect it's running in a browser
   - Click "Connect Google Drive" to authenticate

## 🎯 How to Use

### Desktop Version
1. **Launch the app** (Electron window opens)
2. **Click "Browse..."** to select a local folder
3. **Click "Organize Photos"** to start processing
4. **Watch progress** as photos are organized by year
5. **Check results** in the "Organized photo" folder

### Web Version
1. **Open in browser** (http://localhost:3000)
2. **Click "Connect Google Drive"** to authenticate
3. **Select Google Drive folder** (coming soon)
4. **Click "Organize Photos"** to organize cloud photos
5. **View organized folders** in your Google Drive

## 🔧 Platform Detection

The app automatically detects which platform it's running on:

- **Electron**: Shows "Local Files" tab with folder browser
- **Web Browser**: Shows "Google Drive" tab with authentication

## 📁 Organization Structure

Both versions create the same organization structure:

```
Selected Folder/
└── Organized photo/
    ├── 2021/
    │   ├── photo1.jpg
    │   └── photo2.jpg
    ├── 2022/
    │   ├── photo3.jpg
    │   └── photo4.jpg
    └── 2023/
        ├── photo5.jpg
        └── photo6.jpg
```

## 🛠️ Technical Details

### Architecture
- **Unified UI**: Same interface for both platforms
- **Platform Detection**: Automatically switches between local and cloud modes
- **Service Layer**: Abstracted photo organization logic
- **Progress Tracking**: Real-time updates for both platforms

### Dependencies
- **React**: UI framework
- **Material-UI**: Component library
- **Electron**: Desktop app framework
- **Google APIs**: Google Drive integration
- **Node.js**: File system operations

## 🔒 Security & Privacy

- **Local Version**: All processing happens on your computer
- **Web Version**: Uses Google's secure OAuth 2.0 authentication
- **No Data Storage**: App doesn't store your photos or personal data
- **API Limits**: Google Drive API has generous free tier limits

## 🐛 Troubleshooting

### Desktop Version Issues
- **Electron not opening**: Make sure React server is running first
- **Folder access denied**: Check file permissions
- **Photos not found**: Ensure folder contains image files

### Web Version Issues
- **Google Drive auth fails**: Check API credentials in .env file
- **API quota exceeded**: Wait for quota reset (12,000 requests/minute)
- **Browser compatibility**: Use modern browsers (Chrome, Firefox, Safari)

## 🚀 Future Enhancements

- [ ] Google Drive folder picker UI
- [ ] Batch processing for large photo collections
- [ ] Photo metadata editing
- [ ] Duplicate detection and removal
- [ ] Custom organization rules
- [ ] Export/import organization settings

## 📄 License

ISC License - Feel free to use and modify as needed.

---

**Enjoy organizing your photos with photoSorter! 📸**
