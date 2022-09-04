export async function run(_event, db, file_ids) {
  if (!file_ids || file_ids.length < 1) {
    return [];
  }
  return await db.getTagList(
    `SELECT tags.*, tag_locales.* FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id WHERE tags.id IN (SELECT tag_id FROM file_tags WHERE file_id IN (${file_ids}))`
  );
}
