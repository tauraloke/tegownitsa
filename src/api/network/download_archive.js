import AdmZip from 'adm-zip';
import { download } from 'electron-dl';
import { BrowserWindow } from 'electron';
import path from 'path';
import {
  setItem,
  removeItem,
  getItem
} from '../../services/download_item_storage.js';
import fs from 'fs';

const TMP_FOLDER = 'temp';

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} _db
 * @param {string} archiveTitle
 * @param {string} url
 * @param {string} destination
 */
export async function run(_event, _db, archiveTitle, url, destination) {
  if (getItem(url)) {
    console.log('already downloading', url);
    return false;
  }
  const win = BrowserWindow.getFocusedWindow();
  await download(win, url, {
    directory: path.join(__dirname, TMP_FOLDER),
    saveAs: false,
    onStarted: (item) => {
      setItem(item, url);
      win.webContents.send('execute', 'startDownloadProgress', {
        totalBytes: item.getTotalBytes(),
        url: url,
        archiveTitle: archiveTitle
      });
    },
    onProgress: (progress) => {
      console.log('progress', progress.percent);
      win.webContents.send('execute', 'setDownloadProgress', {
        transferredBytes: progress.transferredBytes,
        totalBytes: progress.totalBytes,
        percent: progress.percent,
        url: url
      });
    },
    onCompleted: (file) => {
      let zip = new AdmZip(file.path);
      let pathTo = destination;
      console.log('completed and unpacked to', pathTo);
      win.webContents.send('execute', 'startArchiveUnpacking', {
        url: url,
        archiveTitle: archiveTitle
      });
      zip.extractAllToAsync(pathTo, true, false, () => {
        win.webContents.send('execute', 'completeArchiveUnpacking', {
          url: url,
          archiveTitle: archiveTitle
        });
        fs.unlink(file.path, () => {});
        removeItem(url);
      });
    }
  });
  return true;
}
