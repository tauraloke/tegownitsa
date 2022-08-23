module.exports = {
  run: async (_event, db, locale, title, tag_id) => {
    if (!locale) {
      return false;
    }
    if (title == '') {
      await db.run('DELETE FROM tag_locales WHERE tag_id=? AND locale=?', [
        tag_id,
        locale
      ]);
      return false;
    }
    let checkLocale = await db.query(
      'SELECT id FROM tag_locales WHERE tag_id=? AND locale=?',
      [tag_id, locale]
    );
    if (checkLocale) {
      await db.run(
        'UPDATE tag_locales SET title = ? WHERE tag_id=? AND locale=?',
        [title, tag_id, locale]
      );
    } else {
      await db.run(
        'INSERT INTO tag_locales (tag_id, title, locale) VALUES (?, ?, ?)',
        [tag_id, title, locale]
      );
    }
  }
};
