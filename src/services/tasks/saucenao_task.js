// frontend class

import BaseTask from './base_task.js';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from '../tag_sources_strategies/base_strategy.js';
import SaucenaoResponseExtractor from '../response_extractor/saucenao_response_extractor.js';
// eslint-disable-next-line no-unused-vars
import Job from '../job.js';
import sourceTypes from '../../config/source_type.json';

export default class IqdbTask extends BaseTask {
  /**
   * @param {object} options
   * @param {object} options.file
   * @param {number} options.similarityThreshold
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
          sourceTypes.SAUCENAO
        )
      ) {
        console.log(
          `Resource ${this.resource_name} is already polled for the file #${this.file['id']}`
        );
        this.incrementJobProgress(1);
        return { skip_timeout: true, status: 'OK' };
      }

      console.log(
        `Looking #${this.file.id} ${this.file['preview_path']} at Saucenao`
      );

      let response = new SaucenaoResponseExtractor(
        await window.network.lookupSaucenaoFile({
          preview_path: this.file.preview_path,
          id: this.file.id
        }),
        this.similarityThreshold
      );
      if (response.isValid()) {
        this.strategy.run({
          file: this.file,
          queueList: this.task_queues,
          apiResponse: response
        });
      }

      this.incrementJobProgress(1);
      return { status: 'OK' };
    } catch {
      return { status: 'FAIL' };
    }
  }
}
