'use strict';

import {
  app,
  protocol,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  clipboard,
  nativeImage
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';
import ApiConnector from './services/api_connector.js';
import getDb from './db.js';
import config from './config/store.js';
import menu from './menu.js';
import path from 'path';
import UpdateService from './services/update_service.js';
import i18n from './i18n.backend.js';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

i18n.init();

let win;

async function createWindow() {
  // Create the browser window.
  Menu.setApplicationMenu(menu(i18n));
  win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, './preload.js')
    }
  });
  win.maximize();
  win.show();

  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL(`file://${__dirname}/index.html`);
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

// Connect IPC handlers and load DB
let db = null;
(async () => {
  db = await getDb({ dbPath: config.get('sql_filename_path') });
  new ApiConnector().connectIpcMainHandlers(db);
})();

new UpdateService({ cooldown_hours: 4, mainWindow: win }).connect();

// Listener for context menu
ipcMain.on('context-menu-message', (_event, msg) => {
  let template = [];
  if (msg.srcUrl) {
    template.push({
      label: 'Copy image to clipboard',
      click: () => {
        clipboard.writeImage(
          nativeImage.createFromPath(
            msg.srcUrl.replace(
              process.platform === 'win32' ? /^file:\/\/\// : /^file:\/\//,
              ''
            )
          ),
          'clipboard'
        );
      }
    });
  }
  if (msg.tagId) {
    template.push({
      label: 'Edit tag',
      click: (_event, browserWindow) => {
        browserWindow.webContents.send('execute', 'openTagEditor', msg.tagId);
      }
    });
  }
  if (isDevelopment) {
    template.push({
      label: 'Inspect element',
      click: (_event, browserWindow) => {
        browserWindow.inspectElement(msg.x, msg.y);

        if (browserWindow.webContents.isDevToolsOpened()) {
          browserWindow.webContents.devToolsWebContents.focus();
        }
      }
    });
  }
  if (template.length > 0) {
    const WebViewMenu = Menu.buildFromTemplate(template);
    WebViewMenu.popup(win);
  }
});

// Language switcher listener
ipcMain.on('update-language', async (_event, lang) => {
  i18n.changeLanguage(lang);
  console.log(`Language switched to '${lang}'`);
  Menu.setApplicationMenu(menu(i18n));
});
