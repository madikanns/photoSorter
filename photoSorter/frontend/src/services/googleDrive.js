// Google Drive API service for web version
import { google } from 'googleapis';

class GoogleDriveService {
  constructor() {
    this.gapi = null;
    this.isInitialized = false;
    this.isAuthenticated = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load Google API client
      await this.loadGapi();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      throw error;
    }
  }

  async loadGapi() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          resolve();
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async authenticate() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check if API keys are configured
    if (!process.env.REACT_APP_GOOGLE_API_KEY || !process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      throw new Error('Google Drive API keys not configured. Please set up REACT_APP_GOOGLE_API_KEY and REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
    }

    try {
      await window.gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      this.isAuthenticated = true;
      return user;
    } catch (error) {
      console.error('Google Drive authentication failed:', error);
      throw error;
    }
  }

  async listFolders(parentId = 'root') {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name, parents)',
        orderBy: 'name'
      });

      return response.result.files;
    } catch (error) {
      console.error('Failed to list folders:', error);
      throw error;
    }
  }

  async selectFolder() {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    // For now, return the root folder
    // In a full implementation, you'd show a folder picker UI
    return 'root';
  }

  async listPhotos(folderId) {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and (mimeType contains 'image/' or name contains '.jpg' or name contains '.jpeg' or name contains '.png' or name contains '.gif' or name contains '.bmp' or name contains '.tiff' or name contains '.webp' or name contains '.heic') and trashed=false`,
        fields: 'files(id, name, mimeType, createdTime, modifiedTime, parents)',
        orderBy: 'name'
      });

      return response.result.files;
    } catch (error) {
      console.error('Failed to list photos:', error);
      throw error;
    }
  }

  async createFolder(name, parentId = 'root') {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const response = await window.gapi.client.drive.files.create({
        resource: {
          name: name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId]
        },
        fields: 'id, name'
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  }

  async copyFile(fileId, newName, destinationFolderId) {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const response = await window.gapi.client.drive.files.copy({
        fileId: fileId,
        resource: {
          name: newName,
          parents: [destinationFolderId]
        },
        fields: 'id, name'
      });

      return response.result;
    } catch (error) {
      console.error('Failed to copy file:', error);
      throw error;
    }
  }

  async getFileMetadata(fileId) {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, createdTime, modifiedTime, imageMediaMetadata'
      });

      return response.result;
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw error;
    }
  }

  async getPhotoDate(fileId) {
    try {
      const metadata = await this.getFileMetadata(fileId);
      
      // Try to get date from image metadata first
      if (metadata.imageMediaMetadata && metadata.imageMediaMetadata.date) {
        return new Date(metadata.imageMediaMetadata.date).getFullYear().toString();
      }
      
      // Fall back to creation time
      if (metadata.createdTime) {
        return new Date(metadata.createdTime).getFullYear().toString();
      }
      
      // Fall back to modification time
      if (metadata.modifiedTime) {
        return new Date(metadata.modifiedTime).getFullYear().toString();
      }
      
      // Default to current year
      return new Date().getFullYear().toString();
    } catch (error) {
      console.error('Failed to get photo date:', error);
      return new Date().getFullYear().toString();
    }
  }

  async organizePhotos(folderId, progressCallback) {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }

    try {
      // Get all photos in the folder and subfolders
      const photos = await this.getAllPhotosRecursively(folderId);
      
      if (photos.length === 0) {
        return {
          success: false,
          message: 'No photos found in the selected folder',
          results: {
            totalPhotos: 0,
            organizedByYear: {},
            duplicates: 0,
            problematic: 0
          }
        };
      }

      // Create main "Organized photo" folder
      const organizedFolder = await this.createFolder('Organized photo', folderId);
      
      const organizedByYear = {};
      const duplicates = [];
      const problematic = [];
      let processedCount = 0;

      // Process each photo
      for (const photo of photos) {
        try {
          const year = await this.getPhotoDate(photo.id);
          
          // Create year folder if it doesn't exist
          let yearFolder = await this.findOrCreateYearFolder(organizedFolder.id, year);
          
          // Check for duplicates and copy photo
          const newName = await this.getUniqueFileName(yearFolder.id, photo.name);
          if (newName !== photo.name) {
            duplicates.push(photo.name);
          }
          
          await this.copyFile(photo.id, newName, yearFolder.id);
          
          // Count photos by year
          organizedByYear[year] = (organizedByYear[year] || 0) + 1;
          processedCount++;

          // Send progress update
          if (progressCallback) {
            progressCallback({
              processed: processedCount,
              total: photos.length,
              current: photo.name,
              source: photo.parents ? 'Google Drive' : 'Unknown'
            });
          }

        } catch (error) {
          console.error(`Error processing ${photo.name}:`, error);
          problematic.push(photo.name);
        }
      }

      return {
        success: true,
        message: `Successfully organized ${processedCount} photos from Google Drive!`,
        results: {
          totalPhotos: photos.length,
          organizedByYear,
          duplicates: duplicates.length,
          problematic: problematic.length,
          processed: processedCount,
          organizedFolder: `Google Drive: ${organizedFolder.name}`
        }
      };

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
  }

  async getAllPhotosRecursively(folderId, allPhotos = []) {
    // Get photos in current folder
    const photos = await this.listPhotos(folderId);
    allPhotos.push(...photos);

    // Get subfolders and recurse
    const folders = await this.listFolders(folderId);
    for (const folder of folders) {
      await this.getAllPhotosRecursively(folder.id, allPhotos);
    }

    return allPhotos;
  }

  async findOrCreateYearFolder(parentId, year) {
    try {
      // Try to find existing year folder
      const folders = await this.listFolders(parentId);
      const existingFolder = folders.find(f => f.name === year);
      
      if (existingFolder) {
        return existingFolder;
      }
      
      // Create new year folder
      return await this.createFolder(year, parentId);
    } catch (error) {
      console.error('Failed to find or create year folder:', error);
      throw error;
    }
  }

  async getUniqueFileName(folderId, originalName) {
    try {
      const files = await this.listPhotos(folderId);
      const existingNames = files.map(f => f.name);
      
      if (!existingNames.includes(originalName)) {
        return originalName;
      }
      
      // Generate unique name
      const ext = originalName.split('.').pop();
      const baseName = originalName.replace(`.${ext}`, '');
      let counter = 1;
      
      while (existingNames.includes(`${baseName}_${counter}.${ext}`)) {
        counter++;
      }
      
      return `${baseName}_${counter}.${ext}`;
    } catch (error) {
      console.error('Failed to get unique file name:', error);
      return originalName;
    }
  }
}

export default new GoogleDriveService();
