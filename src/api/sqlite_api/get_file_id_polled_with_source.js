export async function run(_event, db, source_type) {
  return (
    await db.queryAll(
      'SELECT id FROM files WHERE id IN (SELECT file_id FROM pollee_file_sources WHERE source=?)',
      [source_type]
    )
  ).map((r) => r.id);
}
