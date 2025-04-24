import { handlePythonMessage } from '@/services/python-worker';

export async function run(
  _event,
  _db,
  { imagePath, generalThreshold, characterThreshold }
) {
  console.log('Detect tags on file: ', imagePath);
  console.log('Ping:', await handlePythonMessage({ action: 'ping' }));

  return await handlePythonMessage({
    action: 'wd_predict_tags',
    params: {
      filepath: imagePath,
      general_threshold: generalThreshold,
      character_threshold: characterThreshold
    }
  });
}
