const fs = require('fs');
const iqdb = require('iqdb-client');

module.exports = {
  run: async (_event, _db, file_path) => {
    return await iqdb.searchPic(fs.readFileSync(file_path), { lib: 'www' });
  }
};