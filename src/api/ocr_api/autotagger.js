import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
import tags from '../../config/danbooru_tags.json';
import namespaces from '../../config/tag_namespaces.json';
import { getItem } from '../../services/download_item_storage.js';

const LIMIT = 50;
const PREPARED_IMAGE_SIZE = 224;
const MAX_COLOR_VALUE = 255;
const MODEL_SAVEPOINT_FILENAME = 'saved_model.pb';
const MODEL_ZIP_URL =
  'https://github.com/tauraloke/tegownitsa/releases/download/v0.12.0/danbooru.zip';

const namespaceCorrections = {
  0: namespaces.GENERAL, // General
  1: namespaces.CREATOR, // Artist
  3: namespaces.SERIES, // Copyright
  4: namespaces.CHARACTER, // Character
  5: namespaces.META // Meta
};

/**
 * Replace namespace codes from danbooru' codes to inner ones
 * @param {[{ score: string, tag: { namespace: number } }]} scoredTags
 * @returns {[{ score: string, tag: { namespace: number } }]}
 */
function correctNameSpaces(scoredTags) {
  let result = scoredTags;
  for (let i = 0; i < scoredTags.length; i++) {
    result[i].tag.namespace =
      namespaceCorrections[scoredTags[i].tag.category] || namespaces.GENERAL;
  }
  return result;
}

export async function run(_event, _db, filepath) {
  console.log('current autotagger api folder', __dirname); // TODO: remove
  // в винде в релизе будет: current autotagger api folder D:\projects\tegownitsa\dist_electron\win-unpacked\resources\app.asar
  const modelDirPath = path.join(
    __dirname,
    '..',
    'libs',
    'autotagger',
    'danbooru'
  );
  if (!fs.existsSync(path.join(modelDirPath, MODEL_SAVEPOINT_FILENAME))) {
    if (getItem(MODEL_ZIP_URL)) {
      return { status: 'Fail', error: 'model_still_loading' };
    }
    return {
      status: 'Fail',
      error: 'model_not_found',
      url: MODEL_ZIP_URL,
      destination: path.join(modelDirPath, '..')
    };
  }
  let model = await tf.node.loadSavedModel(
    modelDirPath,
    ['serve'],
    'serving_default'
  );

  return {
    status: 'OK',
    result: tf.tidy(() => {
      let tensor = tf.node
        .decodeImage(fs.readFileSync(filepath))
        .resizeBilinear([PREPARED_IMAGE_SIZE, PREPARED_IMAGE_SIZE]);
      tensor = tensor.div(MAX_COLOR_VALUE);
      tensor = tensor.expandDims().transpose([0, 3, 1, 2]); // move color channel to 2nd place
      let scores = model.predict({ 'input.1': tensor })['ret.11'];
      scores = scores
        .sub(tf.min(scores).dataSync()[0])
        .div(tf.max(scores).dataSync()[0] - tf.min(scores).dataSync()[0]);
      let scoredTags = [];
      scores = scores.dataSync();
      for (let i in scores) {
        scoredTags.push({ score: scores[i], tag: tags[i] });
      }
      let sortedScoredTags = scoredTags.sort((a, b) => a.score - b.score);
      return correctNameSpaces(
        sortedScoredTags
          .slice(sortedScoredTags.length - LIMIT, sortedScoredTags.length)
          .reverse()
      );
    })
  };
}
