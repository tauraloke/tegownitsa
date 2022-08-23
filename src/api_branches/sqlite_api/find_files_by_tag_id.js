module.exports = {
  run: async (_event, db, title, locale = null) => {
    if (locale) {
      return await db.queryAll(
        'SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id WHERE tag_locales.title = ? AND tag_locales.locale = ?',
        [title, locale]
      );
    } else {
      return await db.queryAll(
        'SELECT files.* FROM files LEFT JOIN file_tags ON file_tags.file_id = files.id LEFT JOIN tag_locales ON tag_locales.tag_id = file_tags.tag_id WHERE tag_locales.title = ?',
        [title]
      );
    }
  }
};
