import { readdir } from 'fs';
import { join } from 'path';
import FileImporter from '../../services/file_importer.js';

export async function run(_event, db, dirPath) {
  readdir(dirPath, async (_error, files) => {
    let file_importer = new FileImporter(db);
    for (let i in files) {
      let absolutePath = join(dirPath, files[i]);
      await file_importer.importFileToStorage(absolutePath);
    }
  });
  return dirPath;
}
