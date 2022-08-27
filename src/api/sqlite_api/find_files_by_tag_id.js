export async function run(_event, db, tag_id) {
  return await db.queryAll(
    'SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id WHERE file_tags.tag_id = ?',
    [tag_id]
  );
}
