// middle layer

import ApiConnector from './services/api_connector.js';
import { ipcRenderer, contextBridge } from 'electron';

window.addEventListener('DOMContentLoaded', async () => {
  // any js code here
  window.ipcRenderer = ipcRenderer;
});

new ApiConnector().connectPreloadHandlers();

contextBridge.exposeInMainWorld('busApi', {
  executeListener: (listener) => {
    return ipcRenderer.on('execute', listener);
  },
  showContextMenu: (msg) => {
    return ipcRenderer.send('context-menu-message', msg);
  },
  changeLanguage: (lang) => {
    return ipcRenderer.send('update-language', lang);
  }
});
