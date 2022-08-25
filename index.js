'use strict';
const path = require('path');
const { app, BrowserWindow, Menu, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const { is } = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');

const menu = require('./src/menu.js');
const getDb = require('./src/db.js');
const config = require('./src/config.js');
const ApiConnector = require('./src/services/api_connector.js');

unhandled();
debug();
contextMenu();

// Note: Must match 'build.appId' in package.json
app.setAppUserModelId('com.electron.Tegownitsa');

if (!is.development) {
  const FOUR_HOURS = 1000 * 60 * 60 * 4;
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, FOUR_HOURS);

  autoUpdater.checkForUpdates();
}

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js'),
      nodeIntegration: true
    }
  });

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = undefined;
  });

  await win.loadFile(path.join(__dirname, 'src', 'index.html'));

  return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit();
  }
});

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

(async () => {
  await app.whenReady();
  Menu.setApplicationMenu(menu);
  mainWindow = await createMainWindow();
  mainWindow.webContents.executeJavaScript('searchFilesByCaption()');
  mainWindow.webContents.executeJavaScript('showAllTags()');

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
})();

// Connect IPC handlers and load DB
let db = null;
(async () => {
  db = await getDb({ dbPath: config.get('sql_filename_path') });
  new ApiConnector().connectIpcMainHandlers(db);
})();
