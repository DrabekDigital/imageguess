const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;
let currentFolderPath = '';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, process.platform === 'darwin' ? 'icons/macos/icon.icns' : 'icons/windows/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Create menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // Trigger the native folder selection in the renderer
            mainWindow.webContents.send('trigger-folder-selection');
          }
        },
        {
          label: 'Close Folder',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            closeFolder();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Next Image',
          accelerator: 'Right',
          click: () => {
            nextImage();
          }
        },
        {
          label: 'Previous Image',
          accelerator: 'Left',
          click: () => {
            previousImage();
          }
        },
        {
          label: 'Reveal Image',
          accelerator: 'Space',
          click: () => {
            revealImage();
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle folder selection notification
ipcMain.handle('folder-selected-notification', async (event, data) => {
  console.log('Folder selected notification:', data);
  currentFolderPath = data.folderName;
  return { success: true };
});

function nextImage() {
  mainWindow.webContents.send('next-image');
}

function previousImage() {
  mainWindow.webContents.send('previous-image');
}

function revealImage() {
  mainWindow.webContents.send('reveal-image');
}

function closeFolder() {
  currentFolderPath = '';
  mainWindow.webContents.send('close-folder');
} 