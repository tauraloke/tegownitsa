// Backend side

'use strict';
import Store from 'electron-store';

export default new Store({
  defaults: {
    sql_filename_path: 'db.sqlite3',
    dark_theme: false
  }
});
