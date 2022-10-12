export async function run(_event, db, file_id, is_safe) {
  await db.run('UPDATE files SET is_safe=? WHERE id=?', [is_safe, file_id]);
}
