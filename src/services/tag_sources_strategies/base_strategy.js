// eslint-disable-next-line no-unused-vars
import TaskQueue from '../task_queue.js';
// eslint-disable-next-line no-unused-vars
import BaseResponseExtractor from '../response_extractor/base_response_extractor.js';

export default class BaseStrategy {
  /**
   * @param {Object} options
   * @param {()=>{}} options.onAfterTagsAdded
   */
  constructor({ onAfterTagsAdded }) {
    this.onAfterTagsAdded = onAfterTagsAdded;
  }
  /**
   * @abstract
   * @param {Object} arg
   * @param {Object} arg.file
   * @param {Object<string, TaskQueue>} arg.queueList
   * @param {BaseResponseExtractor} arg.apiResponse
   */
  // eslint-disable-next-line no-unused-vars
  run({ file, queueList, apiResponse }) {
    throw 'Implement method "run()"!';
  }
}
