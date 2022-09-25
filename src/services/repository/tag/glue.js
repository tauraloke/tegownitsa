/**
 * @param {sqlite3.Database} db
 * @param {number} sourceTagId
 * @param {number} targetTagId
 * @returns {Object} result
 * @returns {number[]} result.orphanFileIds
 */
export default async function (db, sourceTagId, targetTagId) {
  let orphanFileIds = [];
  let fileIds = await db.queryAll(
    'SELECT files.id FROM files LEFT JOIN file_tags ON files.id=file_tags.file_id WHERE file_tags.tag_id=?',
    [sourceTagId]
  );
  if (fileIds && fileIds.length > 0) {
    fileIds = fileIds.map((r) => r.id);
    orphanFileIds.push(...fileIds);
    fileIds = fileIds.join(',');
    await db.run(
      `DELETE FROM file_tags WHERE tag_id=? AND file_id in (${fileIds})`,
      [sourceTagId]
    );
  }
  await db.run('DELETE FROM tags WHERE id=?', [sourceTagId]);
  await db.run('DELETE FROM tag_locales WHERE tag_id=?', [sourceTagId]);
  await db.run('UPDATE author_urls SET tag_id=? WHERE tag_id=?', [
    targetTagId,
    sourceTagId
  ]);

  return { orphanFileIds: orphanFileIds };
}
