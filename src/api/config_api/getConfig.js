import config from '../../config/store.js';

export async function run(_event, _db, name) {
  return config.get(name);
}
