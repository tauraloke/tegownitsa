import { clipboard } from 'electron';

export async function run(_event, _db) {
  return clipboard.readText('clipboard');
}
