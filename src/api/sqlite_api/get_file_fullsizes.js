export async function run(_event, db, file_id) {
  await db.queryAll('SELECT * FROM file_fullsizes WHERE file_id=?', [file_id]);
}
