import tagNamespaces from '../../config/tag_namespaces.json';

export async function run(_event, db, file_id, title, locale, source_type) {
  console.log(file_id, title, locale, source_type); // TODO: remove
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
  await db.run('BEGIN TRANSACTION');
  try {
    let tag = await db.query(
      'SELECT tags.id from tags LEFT JOIN tag_locales ON tags.id=tag_locales.tag_id WHERE tag_locales.title=? AND tag_locales.locale=? AND tags.namespace_id=?',
      [title, locale, namespace_id]
    );
    if (tag) {
      tag_id = tag['id'];
    } else {
      await db.run('INSERT INTO tags (id, namespace_id) VALUES (null, ?)', [
        namespace_id
      ]);
      tag_id = (await db.query('SELECT last_insert_rowid() AS tag_id')).tag_id;
      await db.query(
        'INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)',
        [tag_id, title, locale]
      );
    }
    let checkDup = await db.query(
      'SELECT * FROM file_tags WHERE file_id=? AND tag_id=? AND source_type=?',
      [file_id, tag_id, source_type]
    );
    if (checkDup) {
      await db.run('COMMIT');
      return false;
    }
    await db.query(
      'INSERT INTO file_tags (file_id, tag_id, source_type) VALUES (?, ?, ?)',
      [file_id, tag_id, source_type]
    );
    let file_tag_id = (
      await db.query('SELECT last_insert_rowid() AS file_tag_id')
    ).file_tag_id;
    await db.query('UPDATE tags SET file_count = file_count + 1 WHERE id = ?', [
      tag_id
    ]);
    await db.run('COMMIT');

    return {
      id: tag_id,
      locales: { [locale]: title },
      file_tag_id: file_tag_id,
      namespace_id: namespace_id
    };
  } catch (error) {
    console.log(error);
    await db.run('ROLLBACK');
    return false;
  }
}
