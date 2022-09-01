// Backend side
const { PSM, OEM } = require('tesseract.js');
const { TESSERACT_LANGUAGE_DIVIDER } = require('./constants.json');

module.exports = {
  sql_filename_path: 'db.sqlite3',
  dark_theme: false,
  has_auto_updates: true,
  tesseract_psm: PSM.AUTO,
  tesseract_oem: OEM.DEFAULT,
  tesseract_languages: ['eng', 'jpn', 'rus'].join(TESSERACT_LANGUAGE_DIVIDER)
};
