// Platform detection utility
export const isElectron = () => {
  return !!(window && window.electronAPI);
};

export const isWeb = () => {
  return !isElectron();
};

export const getPlatform = () => {
  return isElectron() ? 'electron' : 'web';
};

export const getPlatformCapabilities = () => {
  const platform = getPlatform();
  
  return {
    platform,
    canAccessLocalFiles: platform === 'electron',
    canAccessCloudFiles: true, // Both platforms can access cloud files
    canCreateLocalFolders: platform === 'electron',
    canCreateCloudFolders: true // Both platforms can create cloud folders
  };
};
