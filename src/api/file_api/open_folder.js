const { dialog } = require('electron');

module.exports = {
  run: async (_event, _db) => {
    return await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
  }
};
