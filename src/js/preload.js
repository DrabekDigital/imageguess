const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC communication with error handling
  invoke: async (channel, data) => {
    try {
      return await ipcRenderer.invoke(channel, data);
    } catch (error) {
      console.error(`IPC Error: ${error.message}`);
      throw error;
    }
  },
  
  // Listen for events from main process with error handling
  onTriggerFolderSelection: (callback) => {
    try {
      ipcRenderer.on('trigger-folder-selection', callback);
    } catch (error) {
      console.error('Error setting up folder selection listener:', error);
    }
  },
  onNextImage: (callback) => {
    try {
      ipcRenderer.on('next-image', callback);
    } catch (error) {
      console.error('Error setting up next image listener:', error);
    }
  },
  onPreviousImage: (callback) => {
    try {
      ipcRenderer.on('previous-image', callback);
    } catch (error) {
      console.error('Error setting up previous image listener:', error);
    }
  },
  onRevealImage: (callback) => {
    try {
      ipcRenderer.on('reveal-image', callback);
    } catch (error) {
      console.error('Error setting up reveal image listener:', error);
    }
  },
  onCloseFolder: (callback) => {
    try {
      ipcRenderer.on('close-folder', callback);
    } catch (error) {
      console.error('Error setting up close folder listener:', error);
    }
  },
  
  // Remove listeners with error handling
  removeAllListeners: (channel) => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      console.error(`Error removing listeners for channel ${channel}:`, error);
    }
  }
}); 