import { is } from 'electron-util';
import { autoUpdater } from 'electron-updater';
import store from '../config/store.js';

export default class UpdateService {
  constructor({ cooldown_hour = 4, mainWindow }) {
    this.cooldown_hour = cooldown_hour;
    this.mainWindow = mainWindow;
  }
  sendStatusToWindow(text) {
    console.log('Updater message: ', text);
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send('message', text);
    }
  }
  connect() {
    if (!store.get('has_auto_updates')) {
      this.sendStatusToWindow('Updates are disabled by user options.');
      return false;
    }
    if (!is.development) {
      try {
        autoUpdater.checkForUpdates();
        setInterval(() => {
          autoUpdater.checkForUpdates();
        }, this.cooldown_hour * 1000 * 60 * 60);
      } catch (error) {
        console.log('Cannot use autoupdater', error);
      }
    }

    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('Checking for update...');
    });
    autoUpdater.on('update-available', (_info) => {
      this.sendStatusToWindow('Update available.');
    });
    autoUpdater.on('update-not-available', (_info) => {
      this.sendStatusToWindow('Update not available.');
    });
    autoUpdater.on('error', (err) => {
      this.sendStatusToWindow('Error in auto-updater. ' + err);
    });
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message =
        log_message +
        ' (' +
        progressObj.transferred +
        '/' +
        progressObj.total +
        ')';
      this.sendStatusToWindow(log_message);
    });
    autoUpdater.on('update-downloaded', (_info) => {
      this.sendStatusToWindow('Update downloaded');
    });
  }
}
