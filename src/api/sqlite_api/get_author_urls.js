export async function run(_event, db, tag_id) {
  return await db.queryAll('SELECT * FROM author_urls WHERE tag_id=?', [
    tag_id
  ]);
}
