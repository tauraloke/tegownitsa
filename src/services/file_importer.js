const fs = require('fs');
const { app, clipboard } = require('electron');
const path = require('path');
const config = require('../config.js');
const phash = require('sharp-phash');
const sharp = require('sharp');
const exifParser = require('exif-parser');
const {
  PREVIEW_PREFIX,
  CAPTION_YET_NOT_SCANNED
} = require('../constants.json');
const sourceTypes = require('../source_type.json');
const { randomDigit } = require('./utils.js');
const addTag = require('../api_branches/sqlite_api/add_tag.js');
const fetch = require('node-fetch');

class FileImporter {
  constructor(db) {
    this.db = db;
  }
  getStorageDirectoryPath() {
    let currentDirPath = path.join(path.dirname(app.getPath('exe')), 'storage');
    return config.get('storage_dir') || currentDirPath;
  }
  generateStorageDirPathForFile() {
    return path.join(
      this.getStorageDirectoryPath(),
      randomDigit().toString(),
      randomDigit().toString()
    );
  }
  generateFilename(absolutePath) {
    return (
      new Date().getTime() +
      randomDigit() +
      randomDigit() +
      path.extname(absolutePath)
    );
  }
  async extractExifTags(file_id, exif) {
    // try to extract exif tags
    if (!exif) {
      return false;
    }
    let tags = [];
    if (exif.Artist) {
      tags.push(`creator:${exif.Artist}`);
    } else {
      if (exif.XPAuthor) {
        let author = Buffer.from(exif.XPAuthor)
          .toString('utf16le')
          .replace(/\0/, '');
        tags.push(`creator:${author}`);
      }
    }
    if (exif.XPKeywords) {
      let XPKeywords = Buffer.from(exif.XPKeywords)
        .toString('utf16le')
        .replace(/\0/, '')
        .split(';');
      tags.push(...XPKeywords);
    }
    tags = tags.filter((v, i, a) => a.indexOf(v) === i); // unique values
    let locale = 'en'; // just default

    //save keywords
    let source_type = sourceTypes.EXIF;
    for (let i in tags) {
      await addTag.run({}, this.db, file_id, tags[i], locale, source_type);
    }
  }
  async getPHash(absolutePath, fileImage) {
    try {
      return await phash(fileImage);
    } catch (e) {
      console.log(`${absolutePath} is not image file`);
      return false;
    }
  }
  getExif(absolutePath) {
    let fileBuffer = fs.readFileSync(absolutePath);
    try {
      return exifParser.create(fileBuffer).parse(fileBuffer).tags;
    } catch (_error) {
      console.log('Cannot extract exif');
      return {};
    }
  }
  async insertFile(
    exif,
    newFilePathInStorage,
    newPreviewPathInStorage,
    absolutePath,
    imagehash,
    metadata
  ) {
    await this.db.query(
      'INSERT INTO files (full_path, preview_path, source_filename, imagehash, width, height, caption, exif_make, exif_model, exif_latitude, exif_longitude, exif_create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [
        newFilePathInStorage,
        newPreviewPathInStorage,
        path.basename(absolutePath),
        imagehash,
        metadata.width,
        metadata.height,
        CAPTION_YET_NOT_SCANNED,
        exif.Make,
        exif.Model,
        exif.GPSLatitude,
        exif.GPSLongitude,
        exif.CreateDate
      ]
    );
    let file_id = await this.db.query('SELECT MAX(id) AS file_id FROM files')
      .file_id;
    if (!file_id) {
      return false;
    }
  }
  async importFileToStorage(absolutePath) {
    if (!fs.statSync(absolutePath).isFile()) {
      return;
    }
    console.log('Loading file: ', absolutePath);
    const storageRootDir = this.getStorageDirectoryPath();
    console.log('Storage root', storageRootDir);
    const storageDirPathForFile = this.generateStorageDirPathForFile();
    const filename = this.generateFilename(absolutePath);
    const fileImage = fs.readFileSync(absolutePath);
    let imagehash = await this.getPHash(absolutePath, fileImage);

    fs.mkdirSync(storageDirPathForFile, { recursive: true });
    const newFilePathInStorage = path.join(storageDirPathForFile, filename);

    fs.copyFile(absolutePath, newFilePathInStorage, () => {});
    const image = await sharp(fileImage);
    const metadata = await image.metadata();

    // make preview
    const newPreviewPathInStorage = path.join(
      storageDirPathForFile,
      PREVIEW_PREFIX + filename
    );
    image.resize(100).toFile(newPreviewPathInStorage);

    let exif = this.getExif(absolutePath);
    let file_id = this.insertFile(
      exif,
      newFilePathInStorage,
      newPreviewPathInStorage,
      absolutePath,
      imagehash,
      metadata
    );
    await this.extractExifTags(file_id, exif);

    return { full_path: newFilePathInStorage, file_id: file_id };
  }
  async importFileFromUrl(url) {
    let buffer = Buffer.from(await (await fetch(url)).buffer());
    const storageRootDir = this.getStorageDirectoryPath();
    const storageDirPathForFile = path.join(storageRootDir, 'tmp');
    fs.mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = path.join(
      storageDirPathForFile,
      path.parse(url).name + '.png'
    );
    await sharp(buffer).toFormat('png').toFile(tmpFilePath);
    return tmpFilePath;
  }
  async importFileFromClipboard() {
    let image = clipboard.readImage('clipboard');
    if (image.isEmpty()) {
      return false;
    }
    const storageRootDir = this.getStorageDirectoryPath();
    const storageDirPathForFile = path.join(storageRootDir, 'tmp');
    fs.mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = path.join(
      storageDirPathForFile,
      new Date().getTime() +
        randomDigit() +
        randomDigit() +
        '_from_clipboard.png'
    );
    fs.writeFileSync(tmpFilePath, image.toPNG());
    return tmpFilePath;
  }
}

module.exports = FileImporter;
