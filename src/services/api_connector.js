const path = require('path');
const fs = require('fs');
const ApiFolder = require('./api_folder.js');
const { camelize } = require('./utils.js');
const { contextBridge, ipcRenderer, ipcMain } = require('electron');

class ApiConnector {
  constructor(api_folder_name = 'api') {
    this.api_folder_name = api_folder_name;
  }
  getApiFolders() {
    if (this.api_folders) {
      return this.api_folders;
    }
    this.api_folders = [];
    fs.readdirSync(path.join(__dirname, '..', this.api_folder_name), {
      withFileTypes: true
    })
      .filter((dir) => dir.isDirectory())
      .map((d) => d.name)
      .forEach((title) => {
        this.api_folders.push(new ApiFolder(title));
      });
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
  connectIpcPreloadHandlers() {
    this.getApiFolders().forEach((branch) => {
      let methods = {};
      branch.snake_method_names.forEach((snake_method_name) => {
        let camel_method_name = camelize(snake_method_name);
        methods[camel_method_name] = async (...args) => {
          try {
            return await ipcRenderer.invoke(camel_method_name, ...args);
          } catch (error) {
            console.error(
              `Wrong calling of method ${branch.snake_title}.${snake_method_name} with args`,
              args
            );
            console.log('Stacktrace', error);
            throw error;
          }
        };
      });
      contextBridge.exposeInMainWorld(camelize(branch.snake_title), methods);
    });
  }
}

module.exports = ApiConnector;
