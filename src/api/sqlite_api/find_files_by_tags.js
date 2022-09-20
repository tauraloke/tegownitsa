import tagNamespaces from '../../config/tag_namespaces.js';

const ALWAYS_TRUE_CONTIDION = '1=1';

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} db
 * @param {string} titles
 * @returns {Promise<[object]>}
 */
export async function run(_event, db, titles) {
  if (!titles) {
    return await db.queryAll(
      'SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id GROUP by files.id ORDER BY files.created_at DESC'
    );
  }

  let namespacePrefixes = Object.keys(tagNamespaces);
  let hardConditions = [ALWAYS_TRUE_CONTIDION];
  let softConditions = titles
    .split(',')
    .map((tag) => {
      let pair = tag.split(':');
      let [namespace, title] =
        pair.length > 1
          ? [pair[0].toUpperCase(), pair[1]]
          : ['GENERAL', pair[0]];
      if (namespacePrefixes.includes(namespace)) {
        return `(tag_locales.title='${title}' AND tags.namespace_id=${tagNamespaces[namespace]})`;
      }
      if (namespace == 'fresh') {
        let minutes = 15;
        hardConditions.push(
          `files.created_at > DATETIME('NOW', '-${minutes} minutes')`
        );
        return null;
      }
    })
    .filter((t) => t);
  if (softConditions.length == 0) {
    softConditions.push(ALWAYS_TRUE_CONTIDION);
  }

  const queryStr = `
    SELECT files.*, COUNT(*) AS tego_rating
      FROM files 
      LEFT JOIN file_tags ON file_tags.file_id = files.id
      LEFT JOIN tags ON tags.id=file_tags.tag_id
      LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id
    WHERE (${softConditions.join(' OR ')}) AND (${hardConditions.join(' AND ')})
    GROUP BY files.id
    ORDER BY tego_rating DESC
    `;

  console.log(queryStr);

  return await db.queryAll(queryStr);
}
