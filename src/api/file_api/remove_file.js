import { unlinkSync } from 'fs';

export async function run(_event, _db, filePath) {
  unlinkSync(filePath);
}
