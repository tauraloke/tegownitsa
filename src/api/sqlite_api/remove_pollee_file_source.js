export async function run(_event, db, row_id) {
  try {
    await db.run('DELETE FROM pollee_file_sources WHERE id=?', [row_id]);
    return true;
  } catch {
    return false;
  }
}
