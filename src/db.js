import sqlite3 from 'sqlite3';
const sqlite3Instance = sqlite3.verbose();

/**@type {sqlite3.Database} */
let dbc = null;

/**
 * @param {sqlite3.Database} dbConnection
 * @param {string} name
 * @returns {sqlite3.Database}
 */
function loadSqliteExtension(dbConnection, name) {
  dbConnection.loadExtension(
    process.platform == 'win32'
      ? `.\\libs\\sqlite\\${name}.dll`
      : `./libs/sqlite/${name}`
  );

  return dbConnection;
}

function _queryAll(query, params) {
  return new Promise(function (resolve, reject) {
    dbc.all(query, params, function (err, row) {
      if (err) reject('Read error: ' + err.message);
      else {
        resolve(row);
      }
    });
  });
}

function _query(query, params) {
  return new Promise(function (resolve, reject) {
    dbc.get(query, params, function (err, row, _stmt) {
      if (err) reject('Read error: ' + err.message);
      else {
        resolve(row);
      }
    });
  });
}

async function _getTagList(query, params = []) {
  let response = await dbc.queryAll(query, params);
  let tags = {};
  response.forEach((row) => {
    tags[row['tag_id']] = tags[row['tag_id']] || {
      id: row['tag_id'],
      locales: []
    };
    tags[row['tag_id']]['locales'].push({
      locale: row['locale'],
      title: row['title']
    });
    tags[row['tag_id']]['source_type'] =
      tags[row['tag_id']]['source_type'] || row['source_type'];
    tags[row['tag_id']]['file_tag_id'] =
      tags[row['tag_id']]['file_tag_id'] || row['file_tag_id'];
    tags[row['tag_id']]['file_id'] =
      tags[row['tag_id']]['file_id'] || row['file_id'];
    tags[row['tag_id']]['file_count'] =
      tags[row['tag_id']]['file_count'] || row['file_count'];
    tags[row['tag_id']]['namespace_id'] =
      tags[row['tag_id']]['namespace_id'] || row['namespace_id'];
  });
  return Object.values(tags);
}

/**
 * @param {object} args
 * @param {string} args.dbPath
 * @returns {Promise<sqlite3.Database>}
 */
async function initDatabase({ dbPath }) {
  console.log('Loading sqlite fuzzy extension...');
  let dbConnection = new sqlite3Instance.Database(dbPath);

  // load fuzzy search extension
  dbConnection = loadSqliteExtension(dbConnection, 'fuzzy');

  dbConnection.queryAll = _queryAll;
  dbConnection.query = _query;
  dbConnection.getTagList = _getTagList;

  console.log('before pragma');
  dbConnection.run('PRAGMA encoding = "UTF-16";');
  console.log('after pragma');
  // make tables if not exists...
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      full_path TEXT,
      preview_path TEXT,
      source_path TEXT,
      source_filename TEXT,
      width INTEGER,
      height INTEGER,
      imagehash CHAR(64),
      caption TEXT COLLATE NOCASE,
      exif_make TEXT,
      exif_model TEXT,
      exif_latitude REAL,
      exif_longitude REAl,
      exif_create_date TIMESTAMP,
      is_safe BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS file_urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      file_id INTEGER,
      url TEXT,
      title TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      file_count INTEGER DEFAULT 0,
      namespace_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS tag_locales (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      tag_id INTEGER,
      title TEXT COLLATE NOCASE,
      locale VARCHAR(2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS file_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      file_id INTEGER,
      tag_id INTEGER,
      source_type INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS author_urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      tag_id INTEGER NOT NULL,
      url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS file_fullsizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      file_id INTEGER NOT NULL,
      url TEXT,
      width INTEGER,
      height INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );
  dbConnection.run(
    `CREATE TABLE IF NOT EXISTS pollee_file_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      file_id INTEGER NOT NULL,
      source INTEGER,
      tags_count INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )`
  );

  console.log('Done.');
  return dbConnection;
}

export default async ({ dbPath }) => {
  if (dbc) {
    return dbc;
  }
  dbc = await initDatabase({ dbPath: dbPath });
  return dbc;
};
