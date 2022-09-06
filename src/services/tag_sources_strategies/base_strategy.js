// eslint-disable-next-line no-unused-vars
import TaskQueue from '../task_queue';

export default class BaseStrategy {
  constructor() {}
  // @Abstract
  /**
   * @param {Object} arg
   * @param {Object} arg.file
   * @param {Object<string, TaskQueue>} arg.queueList
   * @param {Object[]} arg.candidatesList
   */
  // eslint-disable-next-line no-unused-vars
  run({ file, queueList, candidatesList }) {
    throw 'Implement method "run()"!';
  }
}
