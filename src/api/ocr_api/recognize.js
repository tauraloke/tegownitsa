import { createWorker, PSM, OEM } from 'tesseract.js';
import config from '../../config/store.js';

export async function run(_event, _db, imagePath) {
  console.log('Scan file ', imagePath);
  const worker = createWorker();
  await worker.load();
  let languages = config.get('tesseract_languages') || 'eng';
  await worker.loadLanguage(languages);
  await worker.initialize(languages);
  await worker.setParameters({
    tessedit_pageseg_mode: config.get('tesseract_psm') || PSM.AUTO,
    tessedit_ocr_engine_mode: config.get('tesseract_oem') || OEM.DEFAULT
  });
  const result = await worker.recognize(imagePath);
  await worker.terminate();
  return result;
}
