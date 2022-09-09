// frontend class

// eslint-disable-next-line no-unused-vars
import Job from '../job.js';

export default class BaseTask {
  /**
   * @param {object} options
   * @param {Job?} options.job
   */
  constructor(options) {
    Object.assign(this, {}, options);
  }
  /**
   * @param {number} step
   */
  incrementJobProgress(step) {
    if (!this.job) {
      return;
    }
    this.job.incrementProgress(step);
  }
  //@Abstract
  run() {
    throw 'Abstract method should be implemented';
  }
}
