/** @file Download image with larger dimensions. */
import FileImporter from '../../services/file_importer.js';
import fs from 'fs';

const IDENTITY_THRESHOLD = 5;

export async function run(_event, db, file_id, url) {
  console.log('Download a new version for the file', file_id, url);
  let fileImporter = new FileImporter(db);

  // Download a file
  let tmpFilePath = await fileImporter.importFileFromUrl(url);
  if (!tmpFilePath) {
    return false;
  }

  let fileImage = fs.readFileSync(tmpFilePath);
  let imagehash = await fileImporter.getPHash(tmpFilePath, fileImage);

  // Check a file
  let checkIdentity = await db.query(
    'SELECT hamming(files.imagehash, ?) AS distance from files WHERE id = ?',
    [imagehash, file_id]
  );
  if (!checkIdentity) {
    return false;
  }
  if (checkIdentity.distance >= IDENTITY_THRESHOLD) {
    console.log(
      'Error: not identical files',
      file_id,
      url,
      'distance:',
      checkIdentity.distance
    );
    return false;
  }

  // Rewrite a file link in DB
  let { newFilePathInStorage, newPreviewPathInStorage, metadata } =
    await fileImporter.moveFileToMainStorage(fileImage, tmpFilePath);
  await db.run(
    'UPDATE files SET width=?, height=?, imagehash=?, full_path=?, preview_path=? WHERE id=?',
    [
      metadata.width,
      metadata.height,
      imagehash,
      newFilePathInStorage,
      newPreviewPathInStorage,
      file_id
    ]
  );

  // Remove a temp file
  fs.unlinkSync(tmpFilePath);

  return await db.query('SELECT * FROM files WHERE id=?', [file_id]);
}
