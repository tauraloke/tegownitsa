// frontend class

import BaseTask from './base_task.js';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from '../tag_sources_strategies/base_strategy.js';
// eslint-disable-next-line no-unused-vars
import Job from '../job.js';
import sourceTypes from '../../config/source_type.json';

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
        imagePath: this.file['full_path'],
        generalThreshold: this.generalThreshold,
        characterThreshold: this.characterThreshold
      }); // answer: {series_tag: '', character_tag: '', prompt: '1girl, 1boy, breasts, black hair, nude, wings, nip…inged arms, girl on top, closed mouth, collarbone'}
      console.log('AI Tag Detector response', tagResponse);
      // TODO: добавить теги к файлу, желательно чтобы они обновились в интерфейсе тоже.
      // TODO: пометить файл как unsafe, если найдены unsafe буру-теги.
      // TODO: пометить файл как уже опрошенный.

      this.incrementJobProgress(1);
      return { status: 'OK', skip_timeout: true };
    } catch (e) {
      return { status: 'FAIL', skip_timeout: true };
    }
  }
}
