import config from '../../config/store.js';
import constants from '../../config/constants.json';
import { imageThreshold } from '../../services/image_distance.js';

export async function run(_event, db) {
  const similarityThreshold = config.get('image_similarity_threshold');
  const hammingThreshold = similarityThreshold
    ? imageThreshold(similarityThreshold)
    : constants.BASE_DUPLICATE_HAMMING_THRESHOLD;

  return db.queryAll(
    'SELECT files.*, files2.id AS f2_id, files2.preview_path AS f2_preview_path, files2.width AS f2_width, files2.height AS f2_height, files2.source_filename AS f2_source_filename, hamming(files.imagehash, files2.imagehash) AS distance FROM files JOIN files AS files2 ON files.id > files2.id WHERE distance < ?',
    [hammingThreshold]
  );
}
