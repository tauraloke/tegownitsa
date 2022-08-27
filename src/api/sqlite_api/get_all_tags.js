export async function run(_event, db) {
  return await db.getTagList(
    'SELECT tags.*, tag_locales.* FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id;'
  );
}
