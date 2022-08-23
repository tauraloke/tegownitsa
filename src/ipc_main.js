// core calls from index.js to IPC interferency

const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const { getDb } = require('./db.js');
const config = require('./config.js');
const ApiBranch = require('./services/api_branch.js');
const { camelize } = require('./services/utils.js');

let db = null;
(async () => {
  db = await getDb({ dbPath: config.get('sql_filename_path') });
})();

let apiBranches = [];
fs.readdirSync(path.join(__dirname, 'api_branches'), { withFileTypes: true })
  .filter((dir) => dir.isDirectory())
  .map((d) => d.name)
  .forEach((title) => {
    apiBranches.push(new ApiBranch(title));
  });

apiBranches.forEach((branch) => {
  branch.snake_method_names.forEach((snake_method_name) => {
    ipcMain.handle(camelize(snake_method_name), async (event, ...args) => {
      return await branch.getMethod(snake_method_name)(event, db, ...args);
    });
  });
});
