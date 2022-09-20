import tagNamespaces from '../../config/tag_namespaces.js';

export async function run(_event, db, file_id, title, locale, source_type) {
  console.log('Add tag', title, locale, source_type);
  title = title.trim();
  if (!title || !locale || !file_id) {
    return false;
  }
  let tag_id = null;
  let namespaces = Object.keys(tagNamespaces).map((t) => t.toLowerCase());
  let namespace = 'general'; // default
  for (let i in namespaces) {
    let match = title.match(`^${namespaces[i]}:(.*)`);
    if (match) {
      title = match[1];
      namespace = namespaces[i];
      break;
    }
  }
  let namespace_id = tagNamespaces[namespace.toUpperCase()] || 0;

  try {
    let tag = await db.query(
      'SELECT tags.id from tags LEFT JOIN tag_locales ON tags.id=tag_locales.tag_id WHERE tag_locales.title=? AND tag_locales.locale=? AND tags.namespace_id=?',
      [title, locale, namespace_id]
    );
    if (tag) {
      // check tags for dups in this file
      tag_id = tag['id'];
      let checkDup = await db.query(
        'SELECT * FROM file_tags WHERE file_id=? AND tag_id=? AND source_type=?',
        [file_id, tag_id, source_type]
      );
      if (checkDup) {
        return false;
      }
    } else {
      // create tag
      ({ tag_id } = await db.query(
        'INSERT INTO tags (id, namespace_id) VALUES (null, ?) RETURNING id AS tag_id',
        [namespace_id]
      ));
      await db.query(
        'INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)',
        [tag_id, title, locale]
      );
    }
    let { file_tag_id } = await db.query(
      'INSERT INTO file_tags (file_id, tag_id, source_type) VALUES (?, ?, ?) RETURNING id AS file_tag_id',
      [file_id, tag_id, source_type]
    );
    await db.run('UPDATE tags SET file_count = file_count + 1 WHERE id = ?', [
      tag_id
    ]);

    return {
      id: tag_id,
      locales: [{ locale, title }],
      file_tag_id: file_tag_id,
      namespace_id: namespace_id,
      source_type: source_type,
      file_id: file_id
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}
