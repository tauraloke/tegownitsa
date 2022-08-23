const FileImporter = require('../../services/file_importer.js');

module.exports = {
  run: async (_event, db, filePath) => {
    let file_importer = new FileImporter(db);
    console.log('fileimporter',file_importer); //TODO: remove
    return await file_importer.importFileToStorage(filePath);
  }
};
