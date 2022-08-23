module.exports = {
  run: async (_event, db, file_id) => {
    if (!file_id) {
      return false;
    }
    let file = await db.query('SELECT * FROM files WHERE id=?', [file_id]);
    if (!file) {
      return false;
    }
    await db.run('DELETE FROM files WHERE id=?', [file_id]);
    await db.run('DELETE FROM file_tags WHERE file_id=?', [file_id]);
    return file;
  }
};
