import { readFileSync, statSync, mkdirSync, copyFile, writeFileSync } from 'fs';
import { app, clipboard } from 'electron';
import path from 'path';
import phash from 'sharp-phash';
import sharp from 'sharp';
import { create } from 'exif-parser';
import fetch from 'node-fetch';

import config from '../config/store.js';
import {
  PREVIEW_PREFIX,
  CAPTION_YET_NOT_SCANNED
} from '../config/constants.json';
import { EXIF, AI_GENERATED } from '../config/source_type.json';
import { applicationUserAgent, randomDigit, getAppFilesDir } from './utils.js';
import { run as addTag } from '../api/sqlite_api/add_tag.js';
import urlParser from 'url';
import { extractAIMetadata } from './extract_neuro_metadata.js';

/** @type {[{name:string, id:Number, post_count:Number, category:Number}]} */
import booruTagList from '../config/danbooru_tags.json';

const PREVIEW_WIDTH = 140;

class FileImporter {
  constructor(db) {
    this.db = db;
  }
  getStorageDirectoryPath() {
    let currentDirPath = path.join(getAppFilesDir(app, path), 'storage');
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
  /**
   * Parse prompt string and save valuable tokens as tags
   * @param {Number} file_id
   * @param {string} prompt
   */
  extractAIPromptTags(file_id, prompt) {
    const tags = prompt
      .split(',')
      .map((s) =>
        s
          .trim()
          .replaceAll(' ', '_')
          .replaceAll('\\(', '(')
          .replaceAll('\\)', ')')
      );
    let locale = 'en'; // just default
    let source_type = AI_GENERATED;
    for (let i in tags) {
      let booruTag = booruTagList.find((t) => t.name === tags[i]);
      if (booruTag) {
        let prefix = '';
        if (booruTag.category === 3) prefix = 'series:';
        if (booruTag.category === 4) prefix = 'character:';
        // Add only if find the tag
        addTag({}, this.db, file_id, prefix + tags[i], locale, source_type);
      }
    }
  }
  /**
   * Extract tag from exif and save any of them
   * @param {Number} file_id
   * @param {object} exif
   */
  extractExifTags(file_id, exif) {
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
      let prefix = '';
      let booruTag = booruTagList.find((t) => t.name === tags[i]);
      if (booruTag) {
        if (booruTag.category === 3) prefix = 'series:';
        if (booruTag.category === 4) prefix = 'character:';
      }
      addTag({}, this.db, file_id, prefix + tags[i], locale, source_type);
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
      return create(fileBuffer).parse(fileBuffer)?.tags || {};
    } catch (_error) {
      console.log(`Cannot extract exif from ${absolutePath}`);
      return {};
    }
  }
  /**
   *
   * @param {object} exif
   * @param {string} newFilePathInStorage
   * @param {string} newPreviewPathInStorage
   * @param {string} absolutePath
   * @param {string} imagehash
   * @param {object} metadata
   * @param {import('./extract_neuro_metadata.js').AIMetadata} AIMetadata
   * @param {Number} birthtime
   * @returns
   */
  async insertFile(
    exif,
    newFilePathInStorage,
    newPreviewPathInStorage,
    absolutePath,
    imagehash,
    metadata,
    AIMetadata,
    birthtime
  ) {
    let { file_id } = await this.db.query(
      'INSERT INTO files (full_path, preview_path, source_path, source_filename, imagehash, width, height, caption, exif_make, exif_model, exif_latitude, exif_longitude, exif_create_date, neuro_prompt, neuro_negativePrompt, neuro_steps, neuro_sampler, neuro_cfgScale, neuro_seed, neuro_model, neuro_loras, file_birthtime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id AS file_id;',
      [
        newFilePathInStorage,
        newPreviewPathInStorage,
        absolutePath,
        path.basename(absolutePath),
        imagehash,
        metadata.width,
        metadata.height,
        CAPTION_YET_NOT_SCANNED,
        exif.Make,
        exif.Model,
        exif.GPSLatitude,
        exif.GPSLongitude,
        exif.CreateDate,
        AIMetadata.prompt,
        AIMetadata.negativePrompt,
        AIMetadata.steps,
        AIMetadata.sampler,
        AIMetadata.cfgScale,
        AIMetadata.seed,
        AIMetadata.model,
        JSON.stringify(AIMetadata.loras),
        birthtime
      ]
    );
    return file_id;
  }
  async moveFileToMainStorage(fileImage, absolutePath) {
    const storageRootDir = this.getStorageDirectoryPath();
    console.log('Storage root', storageRootDir);
    const storageDirPathForFile = this.generateStorageDirPathForFile();
    const filename = this.generateFilename(absolutePath);
    mkdirSync(storageDirPathForFile, { recursive: true });
    const newFilePathInStorage = path.join(storageDirPathForFile, filename);

    copyFile(absolutePath, newFilePathInStorage, () => {});
    const image = sharp(fileImage);
    const metadata = await image.metadata();
    const AIMetadata = await extractAIMetadata(newFilePathInStorage);
    console.log('extracted AI metadata', AIMetadata);

    // make preview
    const newPreviewPathInStorage = path.join(
      storageDirPathForFile,
      PREVIEW_PREFIX + filename
    );
    await image.resize(PREVIEW_WIDTH).toFile(newPreviewPathInStorage);

    return {
      metadata: metadata,
      newPreviewPathInStorage: newPreviewPathInStorage,
      newFilePathInStorage: newFilePathInStorage,
      AIMetadata: AIMetadata
    };
  }
  async importFileToStorage(absolutePath) {
    if (!statSync(absolutePath).isFile()) {
      return;
    }
    console.log('Loading file: ', absolutePath);
    const fileImage = readFileSync(absolutePath);
    let imagehash = await this.getPHash(absolutePath, fileImage);
    if (!imagehash) {
      return false;
    }
    const { birthtime } = statSync(absolutePath);

    let {
      newFilePathInStorage,
      newPreviewPathInStorage,
      metadata,
      AIMetadata
    } = await this.moveFileToMainStorage(fileImage, absolutePath);

    let exif = this.getExif(absolutePath);
    let file_id = await this.insertFile(
      exif,
      newFilePathInStorage,
      newPreviewPathInStorage,
      absolutePath,
      imagehash,
      metadata,
      AIMetadata,
      birthtime
    );
    if (config.get('import_exif_tags_as_tags')) {
      this.extractExifTags(file_id, exif);
    }
    this.extractAIPromptTags(file_id, AIMetadata.prompt);
    if (AIMetadata.model) {
      const modelTagName = AIMetadata.model
        .replace(/.*[\\/]/, '')
        .replace(/\.[^.]+$/, '');
      addTag({}, this.db, file_id, 'model:' + modelTagName, 'en', AI_GENERATED);
    }

    return { full_path: newFilePathInStorage, file_id: file_id };
  }
  async importFileFromUrl(url) {
    let parsed = urlParser.parse(url);
    let buffer = Buffer.from(
      await (
        await fetch(url, {
          headers: {
            'User-Agent': applicationUserAgent(),
            Referer: parsed.protocol + '//' + parsed.hostname
          },
          method: 'GET'
        })
      ).buffer()
    );
    const storageRootDir = this.getStorageDirectoryPath();
    const storageDirPathForFile = path.join(storageRootDir, 'tmp');
    mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = path.join(
      storageDirPathForFile,
      path.parse(url).name.split('?')[0] + '.png'
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
    mkdirSync(storageDirPathForFile, {
      recursive: true
    });
    let tmpFilePath = path.join(
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
