export async function run(_event, db, file_id, { url, width, height }) {
  await db.run(
    'INSERT INTO file_fullsizes VALUES (file_id, url, width, height)',
    [file_id, url, width, height]
  );
}
