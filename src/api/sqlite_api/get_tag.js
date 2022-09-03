export async function run(_event, db, tag_id) {
  return await db.query('SELECT * FROM tags WHERE id=?', [tag_id]);
}
