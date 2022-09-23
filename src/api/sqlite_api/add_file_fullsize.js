export async function run(_event, db, file_id, { url, width, height }) {
  if (!url || !file_id) {
    return false;
  }
  await db.run(
    'INSERT INTO file_fullsizes (file_id, url, width, height) VALUES (?, ?, ?, ?)',
    [file_id, url, width, height]
  );
}
