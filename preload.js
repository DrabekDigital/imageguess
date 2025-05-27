const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC communication
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  
  // Listen for events from main process
  onTriggerFolderSelection: (callback) => ipcRenderer.on('trigger-folder-selection', callback),
  onNextImage: (callback) => ipcRenderer.on('next-image', callback),
  onPreviousImage: (callback) => ipcRenderer.on('previous-image', callback),
  onRevealImage: (callback) => ipcRenderer.on('reveal-image', callback),
  onCloseFolder: (callback) => ipcRenderer.on('close-folder', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}); 