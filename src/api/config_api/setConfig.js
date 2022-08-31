import config from '../../config/store.js';

export async function run(_event, _db, name, value) {
  return config.set(name, value);
}
