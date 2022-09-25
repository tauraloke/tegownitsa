import sourceType from '../../config/source_type.json';
import glueTag from '../../services/repository/tag/glue.js';

export async function run(_event, db, tag_id, locales) {
  let tag = await db.query('SELECT id FROM tags WHERE id=?', [tag_id]);
  if (!tag || !locales || !(locales.length > 0)) {
    return false;
  }
  try {
    await db.run('BEGIN TRANSACTION');
    await db.run('DELETE FROM tag_locales WHERE tag_id=?', [tag_id]);
    let additionalFileIds = [];
    for (let i = 0; i < locales.length; i++) {
      let locale = locales[i].locale.trim();
      let title = locales[i].title.trim();
      if (title == '') {
        continue;
      }
      let tagDup = await db.query(
        'SELECT tags.id FROM tags LEFT JOIN tag_locales ON tag_locales.tag_id=tags.id WHERE tag_locales.title=? AND tags.id!=?',
        [title, tag_id]
      );
      if (tagDup && tagDup.id) {
        // Glue tags
        console.log('Remove dup tag', tagDup.id, title, locale);
        let { orphanFileIds } = await glueTag(db, tagDup.id, tag_id);
        additionalFileIds.push(...orphanFileIds);
        // end of gluing tags
      }
      await db.run(
        'INSERT INTO tag_locales (title, locale, tag_id) VALUES (?,?,?)',
        [title, locale, tag_id]
      );
    }
    // update tags-to-files links
    if (additionalFileIds.length > 0) {
      additionalFileIds = additionalFileIds.filter(
        (value, index, self) => self.indexOf(value) === index
      ); // uniqize array
      // filter existing file links
      let existedLinks = await db.queryAll(
        'SELECT files.id FROM files LEFT JOIN file_tags ON file_tags.file_id=files.id WHERE file_tags.tag_id=?',
        [tag_id]
      );
      if (existedLinks && existedLinks.length) {
        let existedLinkIds = existedLinks.map((r) => r.id);
        additionalFileIds = additionalFileIds.filter(
          (id) => !(id in existedLinkIds)
        );
      }
      // add file links
      for (let i = 0; i < additionalFileIds.length; i++) {
        await db.run(
          'INSERT INTO file_tags (tag_id, file_id, source_type) VALUES (?,?,?)',
          [tag_id, additionalFileIds[i], sourceType.TAG_MERGE]
        );
      }
    }
    await db.run('COMMIT');
  } catch (error) {
    console.log('Cannot replace tags', error);
    await db.run('ROLLBACK');
  }
  return true;
}
