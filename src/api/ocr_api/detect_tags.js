import { handlePythonMessage } from '@/services/python-worker';
import sourceTypes from '../../config/source_type.json';

export async function run(
  _event,
  db,
  { fileId, imagePath, generalThreshold, characterThreshold }
) {
  console.log('Detect tags on file: ', imagePath);
  console.log('Ping:', await handlePythonMessage({ action: 'ping' }));

  const result = await handlePythonMessage({
    action: 'wd_predict_tags',
    params: {
      filepath: imagePath,
      general_threshold: generalThreshold,
      character_threshold: characterThreshold
    }
  });

  await db.run(
    'INSERT INTO pollee_file_sources (file_id, source) VALUES (?, ?)',
    [fileId, sourceTypes.AI_DETECTED]
  );

  return result;
}
