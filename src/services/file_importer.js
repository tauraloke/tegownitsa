import { readFileSync, statSync, mkdirSync, copyFile, writeFileSync } from 'fs';
import { app, clipboard } from 'electron';
import { join, dirname, extname, basename, parse } from 'path';
import phash from 'sharp-phash';
import sharp from 'sharp';
import { create } from 'exif-parser';
import fetch from 'node-fetch';

import config from '../config/store.js';
import {
  PREVIEW_PREFIX,
  CAPTION_YET_NOT_SCANNED
} from '../config/constants.json';
import { EXIF } from '../config/source_type.json';
import { randomDigit } from './utils.js';
import { run as addTag } from '../api/sqlite_api/add_tag.js';

const PREVIEW_WIDTH = 140;

class FileImporter {
  constructor(db) {
    this.db = db;
  }
  getStorageDirectoryPath() {
    let currentDirPath = join(dirname(app.getPath('exe')), 'storage');
    return config.get('storage_dir') || currentDirPath;
  }
  generateStorageDirPathForFile() {
    return join(
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
      extname(absolutePath)
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
    let source_type = EXIF;
    for (let i in tags) {
      await addTag({}, this.db, file_id, tags[i], locale, source_type);
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
    let fileBuffer = readFileSync(absolutePath);
    try {
      return create(fileBuffer).parse(fileBuffer).tags;
    } catch (_error) {
      console.log(`Cannot extract exif from ${absolutePath}`);
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
    let { file_id } = await this.db.query(
      'INSERT INTO files (full_path, preview_path, source_filename, imagehash, width, height, caption, exif_make, exif_model, exif_latitude, exif_longitude, exif_create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id AS file_id;',
      [
        newFilePathInStorage,
        newPreviewPathInStorage,
        basename(absolutePath),
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
    return file_id;
  }
  async importFileToStorage(absolutePath) {
    if (!statSync(absolutePath).isFile()) {
      return;
    }
    console.log('Loading file: ', absolutePath);
    const storageRootDir = this.getStorageDirectoryPath();
    console.log('Storage root', storageRootDir);
    const storageDirPathForFile = this.generateStorageDirPathForFile();
    const filename = this.generateFilename(absolutePath);
    const fileImage = readFileSync(absolutePath);
    let imagehash = await this.getPHash(absolutePath, fileImage);
    if (!imagehash) {
      return false;
    }

    mkdirSync(storageDirPathForFile, { recursive: true });
    const newFilePathInStorage = join(storageDirPathForFile, filename);

    copyFile(absolutePath, newFilePathInStorage, () => {});
    const image = sharp(fileImage);
    const metadata = await image.metadata();

    // make preview
    const newPreviewPathInStorage = join(
      storageDirPathForFile,
      PREVIEW_PREFIX + filename
    );
    image.resize(PREVIEW_WIDTH).toFile(newPreviewPathInStorage);

    let exif = this.getExif(absolutePath);
    let file_id = await this.insertFile(
      exif,
      newFilePathInStorage,
      newPreviewPathInStorage,
      absolutePath,
      imagehash,
      metadata
    );
    if (config.get('import_exif_tags_as_tags')) {
      await this.extractExifTags(file_id, exif);
    }

    return { full_path: newFilePathInStorage, file_id: file_id };
  }
  async importFileFromUrl(url) {
    let buffer = Buffer.from(await (await fetch(url)).buffer());
    const storageRootDir = this.getStorageDirectoryPath();
    const storageDirPathForFile = join(storageRootDir, 'tmp');
    mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = join(
      storageDirPathForFile,
      parse(url).name.split('?')[0] + '.png'
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
    const storageDirPathForFile = join(storageRootDir, 'tmp');
    mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = join(
      storageDirPathForFile,
      new Date().getTime() +
        randomDigit() +
        randomDigit() +
        '_from_clipboard.png'
    );
    writeFileSync(tmpFilePath, image.toPNG());
    return tmpFilePath;
  }
}

export default FileImporter;
