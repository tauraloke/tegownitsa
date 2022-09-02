export async function run(_event, db, file_tag_id) {
  let tag = await db.query(
    'SELECT * from tags LEFT JOIN file_tags ON file_tags.tag_id=tags.id WHERE file_tags.id=?',
    [file_tag_id]
  );
  if (!tag) {
    return false;
  }
  await db.run('UPDATE tags SET file_count = file_count - 1 WHERE id = ?', [
    tag['tag_id']
  ]);
  await db.run('DELETE FROM file_tags WHERE id = ?', [file_tag_id]);
  return true;
}
