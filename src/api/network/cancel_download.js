import { getItem, removeItem } from '../../services/download_item_storage.js';

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} _db
 * @param {string} url
 */
export async function run(_event, _db, url) {
  let item = getItem(url);
  item.cancel();
  removeItem(url);
  return 'ok';
}
