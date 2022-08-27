import FileImporter from '../../services/file_importer.js';

export async function run(_event, db, url) {
  let file_importer = new FileImporter(db);
  return await file_importer.importFileFromUrl(url);
}
