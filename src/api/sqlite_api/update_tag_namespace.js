export async function run(_event, db, { tag_id, namespace_id }) {
  if (!tag_id) {
    return false;
  }
  let tag = await db.query('SELECT * FROM tags WHERE id=?', [tag_id]);
  if (!tag) {
    return false;
  }
  await db.run('UPDATE tags SET namespace_id=? WHERE id=?', [
    namespace_id,
    tag_id
  ]);
  return true;
}
