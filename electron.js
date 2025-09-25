const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  // Always load from development server when running electron-dev
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Photo Folder'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Helper function to get photo creation date
async function getPhotoDate(filePath) {
  try {
    // Try to get EXIF data using exiftool (if available)
    try {
      const { stdout } = await execAsync(`exiftool -DateTimeOriginal -d "%Y" "${filePath}"`);
      const year = stdout.trim().split('\n')[0].trim();
      if (year && year.length === 4 && !isNaN(year)) {
        return year;
      }
    } catch (exifError) {
      // exiftool not available, fall back to file modification date
    }
    
    // Fall back to file modification date
    const stats = await fs.stat(filePath);
    const date = new Date(stats.mtime);
    return date.getFullYear().toString();
  } catch (error) {
    console.error('Error getting photo date:', error);
    return new Date().getFullYear().toString();
  }
}

// Helper function to check if file is a photo
function isPhotoFile(filename) {
  const photoExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.heic', '.heif'];
  const ext = path.extname(filename).toLowerCase();
  return photoExtensions.includes(ext);
}

// Helper function to recursively find all photo files
async function findPhotoFiles(dirPath, photoFiles = []) {
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively search subdirectories
        await findPhotoFiles(itemPath, photoFiles);
      } else if (stats.isFile() && isPhotoFile(item)) {
        // Add photo file with its full path
        photoFiles.push({
          filename: item,
          fullPath: itemPath,
          relativePath: path.relative(dirPath, itemPath)
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }
  
  return photoFiles;
}

ipcMain.handle('organize-photos', async (event, folderPath) => {
  try {
    console.log('Starting photo organization for:', folderPath);
    console.log('Searching recursively through all subfolders...');
    
    // Recursively find all photo files in the folder and subfolders
    const photoFiles = await findPhotoFiles(folderPath);
    
    console.log(`Found ${photoFiles.length} photo files in all subfolders`);
    
    if (photoFiles.length === 0) {
      return {
        success: false,
        message: 'No photo files found in the selected folder or its subfolders',
        results: {
          totalPhotos: 0,
          organizedByYear: {},
          duplicates: 0,
          problematic: 0
        }
      };
    }
    
    // Create main "Organized photo" folder
    const organizedFolder = path.join(folderPath, 'Organized photo');
    try {
      await fs.mkdir(organizedFolder, { recursive: true });
      console.log('Created main folder: Organized photo');
    } catch (error) {
      // Folder might already exist, that's okay
      console.log('Main folder already exists or created');
    }
    
    const organizedByYear = {};
    const duplicates = [];
    const problematic = [];
    let processedCount = 0;
    
    // Process each photo
    for (const photoInfo of photoFiles) {
      try {
        const sourcePath = photoInfo.fullPath;
        const year = await getPhotoDate(sourcePath);
        
        // Create year folder inside "Organized photo" if it doesn't exist
        const yearFolder = path.join(organizedFolder, year);
        try {
          await fs.access(yearFolder);
        } catch {
          await fs.mkdir(yearFolder, { recursive: true });
          console.log(`Created year folder: Organized photo/${year}`);
        }
        
        // Check if file already exists in destination
        const destPath = path.join(yearFolder, photoInfo.filename);
        try {
          await fs.access(destPath);
          duplicates.push(photoInfo.filename);
          console.log(`Duplicate found: ${photoInfo.filename}`);
        } catch {
          // File doesn't exist, copy it (not move)
          await fs.copyFile(sourcePath, destPath);
          console.log(`Copied ${photoInfo.filename} from ${photoInfo.relativePath} to Organized photo/${year}/`);
        }
        
        // Count photos by year
        organizedByYear[year] = (organizedByYear[year] || 0) + 1;
        processedCount++;
        
        // Send progress update
        if (mainWindow) {
          mainWindow.webContents.send('photo-progress', {
            processed: processedCount,
            total: photoFiles.length,
            current: photoInfo.filename,
            source: photoInfo.relativePath
          });
        }
        
      } catch (error) {
        console.error(`Error processing ${photoInfo.filename}:`, error);
        problematic.push(photoInfo.filename);
      }
    }
    
    const result = {
      success: true,
      message: `Successfully organized ${processedCount} photos from all subfolders into "Organized photo" folder!`,
      results: {
        totalPhotos: photoFiles.length,
        organizedByYear,
        duplicates: duplicates.length,
        problematic: problematic.length,
        processed: processedCount,
        organizedFolder: organizedFolder
      }
    };
    
    console.log('Photo organization completed:', result);
    return result;
    
  } catch (error) {
    console.error('Error organizing photos:', error);
    return {
      success: false,
      message: `Error organizing photos: ${error.message}`,
      results: {
        totalPhotos: 0,
        organizedByYear: {},
        duplicates: 0,
        problematic: 0
      }
    };
  }
});
