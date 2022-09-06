// Backend side
const { PSM, OEM } = require('tesseract.js');
const constants = require('./constants.json');
const tss = require('./tag_source_strategies.json');
const { imageSimilarity } = require('../services/image_distance.js');

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
  tag_source_threshold_iqdb: 0.8,
  tag_source_saucenao_api_key: false,
  tag_source_iqdb_bottom_cooldown: 30,
  tag_source_iqdb_top_cooldown: 60,
  image_similarity_threshold: imageSimilarity(
    constants.BASE_DUPLICATE_HAMMING_THRESHOLD
  ),
  lang: 'en',
  import_exif_tags_as_tags: true
};
