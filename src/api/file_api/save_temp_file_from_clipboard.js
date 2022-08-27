import FileImporter from '../../services/file_importer.js';

export async function run(_event, db) {
  let file_importer = new FileImporter(db);
  return await file_importer.importFileFromClipboard();
}
