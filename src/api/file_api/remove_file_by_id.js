import { unlink } from 'fs';
import { run as removeFileRow } from '../sqlite_api/remove_file_row.js';

export async function run(event, db, file_id) {
  let file = await removeFileRow(event, db, file_id);
  if (!file) {
    return false;
  }
  unlink(file['full_path'], () => {});
  unlink(file['preview_path'], () => {});
  return file;
}
