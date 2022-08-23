// middle layer

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
const ApiBranch = require('./services/api_branch.js');
const { camelize } = require('./services/utils.js');

window.addEventListener('DOMContentLoaded', async () => {
  // any js code here
});

let apiBranches = [];
fs.readdirSync(path.join(__dirname, 'api_branches'), { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((d) => d.name)
  .forEach((title) => {
    apiBranches.push(new ApiBranch(title));
  });

apiBranches.forEach((branch) => {
  let methods = {};
  branch.snake_method_names.forEach((snake_method_name) => {
    let camel_method_name = camelize(snake_method_name);
    methods[camel_method_name] = async (...args) => {
      try {
        console.log(camel_method_name, ...args); //TODO:remove
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
