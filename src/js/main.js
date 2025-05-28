const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { translations, getPreferredLanguage } = require('./translations.js');
const packageJson = require('../../package.json');

// Check if we're in production
const isProduction = app.isPackaged || process.env.NODE_ENV === 'production';

// Get version from package.json
const APP_VERSION = packageJson.version;

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
    icon: path.join(__dirname, '../../icons', process.platform === 'darwin' ? 'macos/icon.icns' : 'windows/icon.ico'),
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

  mainWindow.loadFile(path.join(__dirname, '../../index.html'));

  // Get current language
  const lang = getPreferredLanguage();
  const t = translations[lang];

  // Create menu
  const template = [
    {
      label: t.menuAbout,
      submenu: [
        {
          label: t.menuAbout,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: t.menuAbout,
              message: 'ImageGuess',
              detail: `${t.aboutVersion.replace('{version}', APP_VERSION)}\n${t.aboutCopyright}`,
              buttons: ['OK'],
              icon: path.join(__dirname, '../../icons', process.platform === 'darwin' ? 'macos/icon.icns' : 'windows/icon.ico')
            });
          }
        }
      ]
    },
    {
      label: t.menuFile,
      submenu: [
        {
          label: t.menuOpen,
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('trigger-folder-selection');
          }
        },
        {
          label: t.menuClose,
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            closeFolder();
          }
        },
        { type: 'separator' },
        {
          label: t.menuQuit,
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: t.menuView,
      submenu: [
        {
          label: t.menuNext,
          accelerator: 'Right',
          click: () => {
            nextImage();
          }
        },
        {
          label: t.menuPrevious,
          accelerator: 'Left',
          click: () => {
            previousImage();
          }
        },
        {
          label: t.menuReveal,
          accelerator: 'Space',
          click: () => {
            revealImage();
          }
        },
        { type: 'separator' },
        ...(isProduction ? [] : [{
          label: t.menuDevTools,
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }]),
        {
          label: t.menuReload,
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  // Only set the menu on macOS
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }
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