// frontend class

// eslint-disable-next-line no-unused-vars
import Job from '../job.js';

export default class BaseTask {
  /**
   * @param {object} options
   * @param {Job|null} job
   */
  constructor(options, job = null) {
    this.options = options;
    this.job = job;
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
