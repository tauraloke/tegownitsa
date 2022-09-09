// frontend class

import BaseTask from './base_task.js';
// eslint-disable-next-line no-unused-vars
import BaseStrategy from '../tag_sources_strategies/base_strategy.js';
import SaucenaoResponseExtractor from '../response_extractor/saucenao_response_extractor.js';
// eslint-disable-next-line no-unused-vars
import Job from '../job.js';

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
  async run() {
    console.log(
      `Looking #${this.file.id} ${this.file['preview_path']} at IQDB`
    );

    let response = new SaucenaoResponseExtractor(
      await window.network.lookupSaucenaoFile(this.file['preview_path']),
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
  }
}
