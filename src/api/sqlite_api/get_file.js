export async function run(_event, db, file_id) {
  return await db.query('SELECT * FROM files WHERE id=?', [file_id]);
}
