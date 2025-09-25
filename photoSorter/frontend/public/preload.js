const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running...');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  organizePhotos: (folderPath) => ipcRenderer.invoke('organize-photos', folderPath),
  test: () => 'Electron API is working!',
  onProgress: (callback) => {
    ipcRenderer.on('photo-progress', callback);
  },
  removeProgressListener: (callback) => {
    ipcRenderer.removeListener('photo-progress', callback);
  }
});

console.log('Electron API exposed to main world');
