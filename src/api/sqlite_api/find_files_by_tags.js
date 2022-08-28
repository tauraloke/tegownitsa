export async function run(_event, db, titles) {
  titles = titles
    .split(',')
    .map((t) => `'${t.trim()}'`)
    .join(',');

  return await db.queryAll(
    `SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id WHERE tag_locales.title IN (${titles}) GROUP BY files.id`
  );
}
