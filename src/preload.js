// middle layer

import ApiConnector from './services/api_connector.js';
import { ipcRenderer, contextBridge } from 'electron';

window.addEventListener('DOMContentLoaded', async () => {
  // any js code here
  window.ipcRenderer = ipcRenderer;
});

new ApiConnector().connectPreloadHandlers();

contextBridge.exposeInMainWorld('menuApi', {
  executeListener: (listener) => {
    return ipcRenderer.on('execute', listener);
  }
});
