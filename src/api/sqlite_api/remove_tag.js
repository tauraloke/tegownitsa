export async function run(_event, db, tag_id) {
  if (!tag_id) {
    return false;
  }
  let tag = await db.query('SELECT * FROM tags WHERE id=?', [tag_id]);
  if (!tag) {
    return false;
  }
  await db.run('DELETE FROM tags WHERE id=?', [tag_id]);
  await db.run('DELETE FROM file_tags WHERE tag_id=?', [tag_id]);
  await db.run('DELETE FROM tag_locales WHERE tag_id=?', [tag_id]);
  return tag;
}
