// Backend side

'use strict';
import Store from 'electron-store';
import { PSM, OEM } from 'tesseract.js';
import { TESSERACT_LANGUAGE_DIVIDER } from './constants.json';

export default new Store({
  defaults: {
    sql_filename_path: 'db.sqlite3',
    dark_theme: false,
    tesseract_psm: PSM.AUTO,
    tesseract_oem: OEM.DEFAULT,
    tesseract_languages: ['eng', 'jpn', 'rus'].join(TESSERACT_LANGUAGE_DIVIDER)
  }
});
