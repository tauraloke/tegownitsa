import tagNamespaces from '../../config/tag_namespaces.js';
import hardConditionParsers from '../../services/file_condition_pair_parser.js';

const ALWAYS_TRUE_CONTIDION = '(1=1)';

/**
 * @param {string} value
 * @returns {string}
 */
function sqliteSanitize(value) {
  return value.replace(/'|"|%/g, '');
}

/**
 * @param {Electron.IpcMainInvokeEvent} _event
 * @param {sqlite3.Database} db
 * @param {string} titles
 * @returns {Promise<[object]>}
 */
export async function run(_event, db, titles) {
  if (!titles) {
    return await db.queryAll(
      'SELECT files.* FROM files ORDER BY files.created_at DESC'
    );
  }

  let namespacePrefixes = Object.keys(tagNamespaces);
  let hardConditions = [ALWAYS_TRUE_CONTIDION];
  let softConditions = titles
    .split(',')
    .map((tag) => {
      let pair = tag.split(':');
      let [namespace, title] =
        pair.length > 1 ? [pair[0], pair[1]] : [null, pair[0]];
      title = sqliteSanitize(title);
      console.log(namespace, title);
      if (namespace === null) {
        return `tag_locales.title='${title}'`;
      }
      if (namespacePrefixes.includes(namespace.toUpperCase())) {
        return `tag_locales.title='${title}' AND tags.namespace_id=${
          tagNamespaces[namespace.toUpperCase()]
        }`;
      }
      if (!hardConditionParsers[namespace] || !title) {
        return null;
      }
      let hardCondition = hardConditionParsers[namespace](title);
      if (!hardCondition) {
        return null;
      }
      hardConditions.push(hardCondition);
    })
    .filter((c) => c)
    .map((c) => `(${c})`);

  hardConditions = hardConditions.map((c) => `(${c})`);

  const totalTagContidion =
    softConditions.length == 0
      ? ALWAYS_TRUE_CONTIDION
      : `file_tags.tag_id IN (
    SELECT tags.id FROM tags LEFT JOIN tag_locales ON tag_locales.tag_id = tags.id WHERE (
      ${softConditions.join(' OR ')}
    )
  )`;

  const queryStr = `
    SELECT files.*, COUNT(*) AS tego_rating
      FROM files 
      LEFT JOIN file_tags ON file_tags.file_id = files.id
    WHERE ${totalTagContidion}
    AND ${hardConditions.join(' AND ')}
    GROUP BY files.id
    ORDER BY tego_rating DESC
    `;

  console.log(queryStr);

  return await db.queryAll(queryStr);
}
