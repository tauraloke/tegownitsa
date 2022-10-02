import fs from 'fs';
import path from 'path';
import config from '../../config/store.js';

/**
 * @param {string} dirPath
 * @returns {string[]}
 */
function flatReadDir(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((f) => f.isFile())
    .map((f) => path.join(dirPath, f.name));
}

/**
 * @param {string} dirPath
 * @param {string[]} files
 * @returns {string[]}
 */
function recursiveReadDir(dirPath) {
  let files = fs.readdirSync(dirPath, { withFileTypes: true });
  files = files || [];
  let paths = [];
  for (let i in files) {
    let file = files[i];
    const absolutePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      paths.push(...recursiveReadDir(absolutePath));
    } else {
      paths.push(absolutePath);
    }
  }
  return paths;
}

export async function run(_event, db, dirPath) {
  let paths = config.get('recursive_directory_import')
    ? recursiveReadDir(dirPath)
    : flatReadDir(dirPath);
  let filteredPaths = [];
  for (let i in paths) {
    if (
      !(await db.query('SELECT id FROM files WHERE source_path=?', [paths[i]]))
    ) {
      filteredPaths.push(paths[i]);
    }
  }
  return filteredPaths;
}
