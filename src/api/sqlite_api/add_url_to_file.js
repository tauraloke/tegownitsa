module.exports = {
  run: async (_event, db, url, file_id) => {
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
      'SELECT id FROM file_urls WHERE file_id=? AND url=?',
      [file_id, url]
    );
    if (dupCheck) {
      return false;
    }
    await db.run('INSERT INTO file_urls (file_id, url) VALUES (?, ?)', [
      file_id,
      url
    ]);
    return true;
  }
};
