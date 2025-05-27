const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

let mainWindow;
let currentFolderPath = '';

// Add path sanitization function
function sanitizePath(inputPath) {
  return path.normalize(inputPath).replace(/^(\.\.(\/|\\|$))+/, '');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, process.platform === 'darwin' ? 'icons/macos/icon.icns' : 'icons/windows/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      sandbox: true
    }
  });

  // Set additional security headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self';"],
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['DENY'],
        'X-XSS-Protection': ['1; mode=block']
      }
    });
  });

  // Disable developer tools in production
  if (isProduction) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        event.preventDefault();
      }
    });
    
    // Prevent opening dev tools through menu
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.shift && input.key.toLowerCase() === 'c') {
        event.preventDefault();
      }
    });
  }

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
        ...(isProduction ? [] : [{
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }]),
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

// Update the folder selection handler
ipcMain.handle('folder-selected-notification', async (event, data) => {
  if (!data || typeof data.folderName !== 'string') {
    throw new Error('Invalid folder data');
  }
  const sanitizedPath = sanitizePath(data.folderName);
  currentFolderPath = sanitizedPath;
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