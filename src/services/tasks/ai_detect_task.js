// frontend class

import BaseTask from './base_task.js';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from '../tag_sources_strategies/base_strategy.js';
// eslint-disable-next-line no-unused-vars
import Job from '../job.js';
import sourceTypes from '../../config/source_type.json';
import booruTagList from '../../config/danbooru_tags.json';

/**
 * Convert character structure to array for import tags.
 * @param {{prompt:string,character_tag:string,series_tag:string}} response
 * @returns {string[]}
 */
function parseAITaggerResponse(response) {
  let tags = response?.prompt?.split(',').map((t) => t.trim()) || [];
  if (response.series_tag) tags.push('series:' + response.series_tag);
  if (response.character_tag) tags.push('character:' + response.character_tag);
  return tags;
}

export default class AIDetectTask extends BaseTask {
  /**
   * @param {object} options
   * @param {object} options.file
   * @param {number} options.generalThreshold
   * @param {number} options.characterThreshold
   * @param {BaseStrategy} options.strategy
   * @param {BaseTask[]} options.task_queues
   * @param {Job} options.job
   */
  // eslint-disable-next-line no-unused-vars
  constructor(options) {
    super(options);
  }
  /**
   * @returns {Promise<{skip_timeout: boolean?;status: string}}
   */
  async run() {
    try {
      if (
        await window.sqliteApi.isFileAlreadyPolled(
          this.file.id,
          sourceTypes.AI_DETECTED
        )
      ) {
        console.log(
          `Resource AI_DETECTED is already polled for the file #${this.file['id']}`
        );
        this.incrementJobProgress(1);
        return { skip_timeout: true };
      }
      console.log(`Looking #${this.file.id} ${this.file['full_path']} by AI`);

      const tagResponse = await window.ocrApi.detectTags({
        fileId: this.file['id'],
        imagePath: this.file['full_path'],
        generalThreshold: this.generalThreshold,
        characterThreshold: this.characterThreshold
      }); // answer: {series_tag: '', character_tag: '', prompt: '1girl, closed mouth, collarbone'}
      console.log('AI Tag Detector response', tagResponse);
      let locale = 'en';

      if (tagResponse.error) {
        return { status: 'FAIL', skip_timeout: true };
      }

      const tags = parseAITaggerResponse(tagResponse);
      let source_type = sourceTypes.AI_DETECTED;

      let isUnsafe = false;
      for (let i in tags) {
        let title = tags[i];
        console.log(`add tag ${title} to file ${this.file['id']}`);
        await window.sqliteApi.addTag(
          this.file['id'],
          title,
          locale,
          source_type
        );

        let booruTag = booruTagList.find((t) => t.name === tags[i]);
        if (booruTag) {
          if (booruTag.unsafe) isUnsafe = true;
        }
      }

      if (isUnsafe) {
        window.sqliteApi.updateFileIsSafeField(this.file['id'], false);
      }

      this.incrementJobProgress(1);
      return { status: 'OK', skip_timeout: true };
    } catch (e) {
      return { status: 'FAIL', skip_timeout: true };
    }
  }
}
