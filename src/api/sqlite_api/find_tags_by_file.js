export async function run(_event, db, file_id) {
  return await db.getTagList(
    'SELECT tags.*, tag_locales.*, file_tags.id AS file_tag_id, file_tags.file_id AS file_id, file_tags.source_type AS source_type FROM tag_locales LEFT JOIN tags ON tags.id=tag_locales.tag_id LEFT JOIN file_tags ON tags.id=file_tags.tag_id WHERE file_id=?;',
    [file_id]
  );
}
