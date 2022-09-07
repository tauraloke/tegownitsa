import { readdirSync } from 'fs';
import { join } from 'path';

export async function run(_event, db, dirPath) {
  let result = [];
  let files = readdirSync(dirPath, { withFileTypes: true });
  for (let i = 0; i < files.length; i++) {
    let absolutePath = join(dirPath, files[i].name);
    if (files[i].isDirectory()) {
      continue;
    }
    let dup = await db.query('SELECT id FROM files WHERE source_path=?', [
      absolutePath
    ]);
    if (!dup) {
      result.push(absolutePath);
    }
  }
  return result;
}
