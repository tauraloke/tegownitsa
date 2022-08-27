import { unlink } from 'fs';
import { run as _run } from '../sqlite_api/remove_file_row.js';

export async function run(_event, db, file_id) {
  let file = await _run({}, db, file_id);
  if (!file) {
    return false;
  }
  unlink(file['full_path'], () => {});
  unlink(file['preview_path'], () => {});
  return file;
}
