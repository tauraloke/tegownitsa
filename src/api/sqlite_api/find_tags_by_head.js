export async function run(_event, db, head) {
  if (!head) {
    return [];
  }
  return await db.queryAll(
    'SELECT title FROM tag_locales WHERE title LIKE ? || "%" LIMIT 10;',
    [head]
  );
}
