import { readFileSync } from 'fs';
import { searchPic } from 'iqdb-client/dist/index.js';
import sourceTypes from '../../config/source_type.json';

export async function run(_event, db, file) {
  await db.run(
    'INSERT INTO pollee_file_sources (file_id, source) VALUES (?, ?)',
    [file.id, sourceTypes.IQDB]
  );
  return await searchPic(readFileSync(file['preview_path']), { lib: 'www' });
}
