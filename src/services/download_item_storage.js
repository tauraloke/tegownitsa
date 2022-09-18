/**
 * @file Storage of downloading items. See API files download_archive.js, cancel_download.js.
 */

/** @type {Object<string, Electron.DownloadItem>} */
let items = {};

/**
 * @param {string} name
 * @returns {Electron.DownloadItem}
 */
export function getItem(name) {
  return items[name];
}

/**
 * @param {Electron.DownloadItem} item
 * @param {string} name
 */
export function setItem(item, name) {
  items[name] = item;
}

/**
 * @param {string} name
 */
export function removeItem(item, name) {
  delete items[name];
}
