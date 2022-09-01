import ApiFolder from './api_folder.js';
import { camelize } from './utils.js';
import { ipcMain, ipcRenderer, contextBridge } from 'electron';
import contents from '../.json_bus/api_contents.json';

class ApiConnector {
  constructor() {}
  getApiFolders() {
    if (this.api_folders) {
      return this.api_folders;
    }
    this.api_folders = Object.keys(contents).map(
      (folder) => new ApiFolder(folder, contents[folder])
    );
    return this.api_folders;
  }
  connectIpcMainHandlers(db) {
    this.getApiFolders().forEach((branch) => {
      branch.snake_method_names.forEach((snake_method_name) => {
        ipcMain.handle(camelize(snake_method_name), async (event, ...args) => {
          return await branch.getMethod(snake_method_name)(event, db, ...args);
        });
      });
    });
  }
  connectPreloadHandlers() {
    for (let folder in contents) {
      let methods = {};
      for (let i in contents[folder]) {
        let snake_method_name = contents[folder][i];
        methods[camelize(snake_method_name)] = async (...args) => {
          try {
            return await ipcRenderer.invoke(
              camelize(snake_method_name),
              ...args
            );
          } catch (error) {
            console.error(
              `Wrong calling of method ${folder}.${camelize(
                snake_method_name
              )} with args`,
              args
            );
            console.log('Stacktrace', error);
            throw error;
          }
        };
      }
      contextBridge.exposeInMainWorld(camelize(folder), methods);
    }
  }
}

export default ApiConnector;
