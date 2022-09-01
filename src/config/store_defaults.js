// Backend side
const { PSM, OEM } = require('tesseract.js');
const constants = require('./constants.json');
const tss = require('./tag_source_strategies.json');

module.exports = {
  sql_filename_path: 'db.sqlite3',
  dark_theme: false,
  has_auto_updates: true,
  tesseract_psm: PSM.AUTO,
  tesseract_oem: OEM.DEFAULT,
  tesseract_languages: ['eng', 'jpn', 'rus'].join(
    constants.TESSERACT_LANGUAGE_DIVIDER
  ),
  tag_source_strategies: tss.CATCH_FIRST_ONE,
  tag_source_threshold_iqdb: 0.8
};
