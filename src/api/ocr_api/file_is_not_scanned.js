import { CAPTION_YET_NOT_SCANNED } from '../../config/constants.json';

export async function run(_event, _db, file) {
  return file['caption'] == CAPTION_YET_NOT_SCANNED;
}
