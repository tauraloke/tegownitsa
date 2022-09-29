export async function run(_event, db, file_id, source) {
  return await db.query(
    'SELECT * FROM pollee_file_sources WHERE file_id=? AND source=?',
    [file_id, source]
  );
}
