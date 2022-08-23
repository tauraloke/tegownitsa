const fs = require('fs');
const path = require('path');
const FileImporter = require('../../services/file_importer.js');

module.exports = {
  run: async (_event, db, dirPath) => {
    fs.readdir(dirPath, async (_error, files) => {
      let file_importer = new FileImporter(db);
      for (let i in files) {
        let absolutePath = path.join(dirPath, files[i]);
        await file_importer.importFileToStorage(absolutePath);
      }
    });
    return dirPath;
  }
};
