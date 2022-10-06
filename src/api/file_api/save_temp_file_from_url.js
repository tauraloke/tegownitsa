import FileImporter from '../../services/file_importer.js';

export async function run(_event, db, url) {
  let file_importer = new FileImporter(db);
  try {
    return await file_importer.importFileFromUrl(url);
  } catch (error) {
    console.log('Cannot import file', url, error);
    return null;
  }
}
