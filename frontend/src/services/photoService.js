// Unified photo service that works for both Electron and Web platforms
import { getPlatformCapabilities } from '../utils/platform';

class PhotoService {
  constructor() {
    this.capabilities = getPlatformCapabilities();
  }

  async selectFolder() {
    if (this.capabilities.platform === 'electron') {
      // Use Electron's folder selection for local files
      return await window.electronAPI.selectFolder();
    } else {
      // For web version, we'll use a simple folder input or URL
      return await this.selectWebFolder();
    }
  }

  async selectWebFolder() {
    // Simple approach: let user enter a folder path or URL
    return new Promise((resolve) => {
      const folderPath = prompt(
        'Enter folder path or URL:\n' +
        '• Local path: /Users/username/Pictures\n' +
        '• Google Drive: https://drive.google.com/drive/folders/...\n' +
        '• Dropbox: https://www.dropbox.com/sh/...\n' +
        '• Or any other cloud storage URL'
      );
      
      if (folderPath) {
        resolve(folderPath);
      } else {
        resolve(null);
      }
    });
  }

  async organizePhotos(folderPath, progressCallback) {
    if (this.capabilities.platform === 'electron') {
      // Use Electron's local file system organization
      return await this.organizeLocalPhotos(folderPath, progressCallback);
    } else {
      // For web version, determine folder type and handle accordingly
      return await this.organizeWebPhotos(folderPath, progressCallback);
    }
  }

  async organizeWebPhotos(folderPath, progressCallback) {
    // Determine if it's a local path or cloud URL
    if (this.isLocalPath(folderPath)) {
      return {
        success: false,
        message: 'Local file paths are not accessible from web browsers. Please use the desktop version for local files.',
        results: {
          totalPhotos: 0,
          organizedByYear: {},
          duplicates: 0,
          problematic: 0
        }
      };
    } else if (this.isCloudUrl(folderPath)) {
      return await this.organizeCloudPhotos(folderPath, progressCallback);
    } else {
      return {
        success: false,
        message: 'Invalid folder path. Please provide a valid local path or cloud storage URL.',
        results: {
          totalPhotos: 0,
          organizedByYear: {},
          duplicates: 0,
          problematic: 0
        }
      };
    }
  }

  isLocalPath(path) {
    // Check if it's a local file system path
    return path.startsWith('/') || path.match(/^[A-Za-z]:\\/) || path.startsWith('file://');
  }

  isCloudUrl(path) {
    // Check if it's a cloud storage URL
    return path.startsWith('http://') || path.startsWith('https://');
  }

  async organizeCloudPhotos(folderPath, progressCallback) {
    // For now, return a message about cloud integration
    return {
      success: false,
      message: `Cloud folder organization for "${folderPath}" is not yet implemented. This feature will be available in a future update.`,
      results: {
        totalPhotos: 0,
        organizedByYear: {},
        duplicates: 0,
        problematic: 0
      }
    };
  }

  async organizeLocalPhotos(folderPath, progressCallback) {
    // Listen for real-time progress updates
    if (window.electronAPI && window.electronAPI.onProgress) {
      window.electronAPI.onProgress(progressCallback);
    }

    const result = await window.electronAPI.organizePhotos(folderPath);

    // Remove progress listener
    if (window.electronAPI && window.electronAPI.removeProgressListener) {
      window.electronAPI.removeProgressListener(progressCallback);
    }

    return result;
  }

  async organizeGoogleDrivePhotos(folderId, progressCallback) {
    try {
      await googleDriveService.initialize();
      return await googleDriveService.organizePhotos(folderId, progressCallback);
    } catch (error) {
      return {
        success: false,
        message: `Google Drive organization failed: ${error.message}`,
        results: {
          totalPhotos: 0,
          organizedByYear: {},
          duplicates: 0,
          problematic: 0
        }
      };
    }
  }


  getPlatformInfo() {
    return {
      platform: this.capabilities.platform,
      canAccessLocalFiles: this.capabilities.canAccessLocalFiles,
      canAccessCloudFiles: this.capabilities.canAccessCloudFiles,
      canCreateLocalFolders: this.capabilities.canCreateLocalFolders,
      canCreateCloudFolders: this.capabilities.canCreateCloudFolders
    };
  }
}

export default new PhotoService();
