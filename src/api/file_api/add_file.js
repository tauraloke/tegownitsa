const FileImporter = require('../../services/file_importer.js');

module.exports = {
  run: async (_event, db, filePath) => {
    let file_importer = new FileImporter(db);
    return await file_importer.importFileToStorage(filePath);
  }
};
