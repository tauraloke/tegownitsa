export async function run(_event, db, head) {
  if (!head) {
    return [];
  }
  return await db.queryAll(
    'SELECT tag_locales.title, tags.namespace_id, tags.id, tag_locales.locale FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id WHERE tag_locales.title LIKE ? || "%" LIMIT 10;',
    [head]
  );
}
