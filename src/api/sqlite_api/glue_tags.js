import glueTag from '../../services/repository/tag/glue.js';
import sourceType from '../../config/source_type.json';

export async function run(_event, db, sourceTagId, targetTagId) {
  console.log('glue tags', sourceTagId, targetTagId);
  let check = await db.query(
    'SELECT COUNT(*) AS count FROM tags WHERE id=? OR id=?',
    [targetTagId, sourceTagId]
  );
  if (check.count != 2) {
    return false;
  }

  let { orphanFileIds } = await glueTag(db, sourceTagId, targetTagId);
  for (let i = 0; i < orphanFileIds.length; i++) {
    await db.run(
      'INSERT INTO file_tags (tag_id, file_id, source_type) VALUES (?,?,?)',
      [targetTagId, orphanFileIds[i], sourceType.TAG_MERGE]
    );
  }

  return true;
}
