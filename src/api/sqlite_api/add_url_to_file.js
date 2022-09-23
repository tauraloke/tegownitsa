export async function run(_event, db, { url, title = null }, file_id) {
  if (!url) {
    return false;
  }
  if (url.match('^//')) {
    url = 'https:' + url;
  }
  let file = await db.query('SELECT * FROM files WHERE id=?', [file_id]);
  if (!file) {
    return false;
  }
  let dupCheck = await db.query(
    'SELECT id, title FROM file_urls WHERE file_id=? AND url=?',
    [file_id, url]
  );
  if (dupCheck) {
    if (dupCheck.title == title) {
      return false;
    }
    await db.run('UPDATE file_urls SET title=? WHERE id=?', [
      title,
      dupCheck.id
    ]);
  }
  await db.run('INSERT INTO file_urls (file_id, url, title) VALUES (?, ?, ?)', [
    file_id,
    url,
    title
  ]);
  return true;
}
