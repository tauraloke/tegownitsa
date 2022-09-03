export async function run(_event, db, tag_id) {
  return await db.queryAll('SELECT * FROM tag_locales WHERE tag_id=?', [
    tag_id
  ]);
}
