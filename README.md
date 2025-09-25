# PhotoSorter - Smart Photo Organization Tool

A powerful application that automatically organizes your photos and videos by location and date using GPS metadata extraction.

## 🌟 Features

- **Location-Based Organization**: Automatically organizes photos by GPS location
- **Date-Based Structure**: Creates year/month folder structure
- **Hybrid Architecture**: Works as both desktop (Electron) and web application
- **GPS Extraction**: Robust GPS data extraction from various image formats (JPEG, HEIC, etc.)
- **Reverse Geocoding**: Converts GPS coordinates to human-readable location names
- **Duplicate Detection**: Identifies and manages duplicate photos
- **Video Support**: Organizes both photos and videos
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Folder Structure

The application creates organized folder structures like:

```
Organized Photos/
├── San Ramon, CA/
│   ├── 2024/
│   │   ├── January/
│   │   │   ├── IMG_001.jpg
│   │   │   └── IMG_002.jpg
│   │   └── February/
│   │       └── IMG_003.jpg
│   └── 2023/
│       └── December/
│           └── IMG_004.jpg
└── Unknown Location/
    └── 2024/
        └── March/
            └── IMG_005.jpg
```

## 🚀 Quick Start

### Web Version (Recommended)

1. **Start the GPS server:**
   ```bash
   cd photoSorter/frontend/public
   python3 gps-extractor.py 8088 &
   ```

2. **Start the web server:**
   ```bash
   python3 -m http.server 8087
   ```

3. **Open in browser:**
   ```
   http://localhost:8087/photoSorter-simple.html
   ```

### Desktop Version (Electron)

1. **Install dependencies:**
   ```bash
   cd photoSorter/frontend
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

## 🛠️ Requirements

- **Node.js** (v14 or higher)
- **Python 3** (for GPS extraction server)
- **exiftool** (for robust GPS data extraction)
  ```bash
  # macOS
  brew install exiftool
  
  # Ubuntu/Debian
  sudo apt-get install exiftool
  
  # Windows
  # Download from https://exiftool.org/
  ```

## 📋 Usage

### Web Version

1. **Select Folder**: Click "📁 Select Folder" to choose your photos
2. **Grant Permission**: Allow write access when prompted
3. **Organize**: Click "Organize Photos" to start processing
4. **Results**: Check the "Organized Photos" folder in your selected directory

### Desktop Version

1. **Launch**: Start the Electron application
2. **Select Folder**: Choose your photos folder
3. **Organize**: Click "Organize Photos"
4. **Results**: View organized folders in your selected directory

## 🔧 Technical Details

### GPS Extraction

- **Server-Side Processing**: Python Flask service with exiftool
- **Multiple APIs**: OpenStreetMap Nominatim and BigDataCloud for reverse geocoding
- **California Coordinate Detection**: Automatic longitude correction for California photos
- **Robust Parsing**: Handles various EXIF formats and byte orders

### File System Access

- **Modern API**: Uses File System Access API for folder creation
- **Permission Management**: Requests write access upfront
- **Fallback Support**: Traditional file input for older browsers

### Supported Formats

**Images**: JPEG, PNG, HEIC, TIFF, BMP, GIF
**Videos**: MP4, MOV, AVI, MKV, WebM, M4V, 3GP, FLV, WMV

## 🐛 Troubleshooting

### Common Issues

1. **"User activation is required"**: Grant write permission when selecting folder
2. **"No GPS data found"**: Ensure photos have location data enabled
3. **"Cannot create folders"**: Check browser permissions and try refreshing

### GPS Server Issues

- Ensure exiftool is installed: `exiftool -ver`
- Check server is running: `lsof -i:8088`
- Restart server if needed: `pkill -f "python3 gps-extractor.py"`

## 📝 Development

### Project Structure

```
photoSorter/
├── frontend/
│   ├── public/
│   │   ├── photoSorter-simple.html    # Web version
│   │   ├── gps-extractor.py           # GPS extraction server
│   │   └── electron.js                # Electron main process
│   ├── src/
│   │   ├── App.js                     # Desktop app
│   │   ├── services/                  # API services
│   │   └── utils/                     # Utility functions
│   └── package.json
└── README.md
```

### Key Files

- **photoSorter-simple.html**: Main web application
- **gps-extractor.py**: GPS extraction server
- **App.js**: Desktop Electron application
- **googleDrive.js**: Google Drive integration (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **exiftool** for robust EXIF data extraction
- **OpenStreetMap Nominatim** for reverse geocoding
- **BigDataCloud** for additional geocoding services
- **JSZip** for zip file creation
- **Electron** for desktop application framework

---

**Note**: This application requires photos with GPS metadata. Ensure location services are enabled when taking photos for best results.
