import tagNamespaces from '../../config/tag_namespaces.js';

/**
 * @typedef {Object} Tag
 * @property {string} title
 * @property {string} locale
 */

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} db
 * @param {Tag} tag
 * @returns {Promise<[object]>}
 */
export async function run(_event, db, tag, url) {
  if (!url || !tag || !tag.title) {
    return false;
  }
  tag.locale = tag.locale || 'en';
  console.log('Add author url', tag.title, url);
  let checkDup = await db.query(
    'SELECT id, title FROM author_urls WHERE url=?',
    [url]
  );
  if (checkDup) {
    return false;
  }
  let tagWithId = await db.query(
    `SELECT tags.id
      FROM tags
      LEFT JOIN tag_locales ON tags.id=tag_locales.tag_id
     WHERE tags.namespace=? AND tag_locales.title=? AND tag_locales.locale=?`,
    [tagNamespaces.CREATOR, tag.title, tag.locale]
  );
  if (!tagWithId) {
    return false;
  }
  await db.run('INSERT INTO author_urls VALUES (tag_id, url)', [tagWithId.id]);
}
