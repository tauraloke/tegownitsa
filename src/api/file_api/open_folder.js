import { dialog } from 'electron';

export async function run(_event, _db) {
  return await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
}
