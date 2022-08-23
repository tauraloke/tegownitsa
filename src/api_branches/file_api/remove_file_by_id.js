const fs = require('fs');
const removeFileRow = require('../sqlite_api/remove_file_row.js');

module.exports = {
  run: async (_event, db, file_id) => {
    let file = await removeFileRow.run({}, db, file_id);
    if (!file) {
      return false;
    }
    fs.unlink(file['full_path'], () => {});
    fs.unlink(file['preview_path'], () => {});
    return file;
  }
};
