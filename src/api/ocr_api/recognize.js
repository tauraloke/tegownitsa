const { createWorker, PSM } = require('tesseract.js');

module.exports = {
  run: async (_event, _db, imagePath, languages = []) => {
    console.log('Scan file ', imagePath);
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage(languages.join('+'));
    await worker.initialize(languages.join('+'));
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO
    });
    const result = await worker.recognize(imagePath);
    await worker.terminate();
    return result;
  }
};
