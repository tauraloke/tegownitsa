import { readFileSync } from 'fs';
import { searchPic } from 'iqdb-client/dist/index.js';

export async function run(_event, _db, file_path) {
  return await searchPic(readFileSync(file_path), { lib: 'www' });
}
