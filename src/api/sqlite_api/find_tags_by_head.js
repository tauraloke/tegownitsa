import { prepareTag } from '@/services/utils.js';
import tagNamespaces from '../../config/tag_namespaces.js';
const namespaces = Object.keys(tagNamespaces).map((n) => n.toLowerCase());

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} db
 * @param {string} head
 * @param {string|null} namespace
 * @returns {Promise<[object]>}
 */
export async function run(_event, db, head, namespace = null) {
  if (!head) {
    return [];
  }
  head = prepareTag(head);
  let namespaceCondition = '1=1';
  if (namespaces.includes(namespace)) {
    let namespace_id = tagNamespaces[namespace.toUpperCase()];
    namespaceCondition = `tags.namespace_id=${namespace_id}`;
  }
  return await db.queryAll(
    `SELECT tag_locales.title,
            tags.namespace_id,
            tags.id,
            tag_locales.locale
       FROM tag_locales
       LEFT JOIN tags ON tags.id=tag_locales.tag_id
     WHERE tag_locales.title LIKE ? || "%" AND ${namespaceCondition}
     LIMIT 10;`,
    [head]
  );
}
