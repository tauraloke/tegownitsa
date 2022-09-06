// Frontend class

import { randomDigit } from './utils.js';
// eslint-disable-next-line no-unused-vars
import TaskQueue from './task_queue.js';

export default class Job {
  /**
   * @param {object} arg
   * @param {number} arg.taskTotalCount
   * @param {TaskQueue} arg.queue
   * @param {object} arg.vueComponent
   */
  constructor({ name, taskTotalCount, queue, vueComponent }) {
    this.name = name;
    this.taskTotalCount = taskTotalCount;
    this.queue = queue;
    this.uid = `${Date.now()}${randomDigit()}${randomDigit()}`;
    this.solvedTaskCount = 0;
    this.vueComponent = vueComponent;
  }
  start() {
    this.vueComponent.jobs.push(this);
    this.vueComponent.jobProgresses[this.uid] = 0;
    this.timeStart = Date.now();
  }
  /**
   * @param {number} step
   */
  incrementProgress(step) {
    this.solvedTaskCount = this.solvedTaskCount + step;
    if (this.taskTotalCount != 0) {
      this.vueComponent.jobProgresses[this.uid] =
        Math.floor((this.solvedTaskCount / this.taskTotalCount) * 1000) / 10;
    }
    if (this.solvedTaskCount == this.taskTotalCount) {
      console.log(`Job ${this.name} is done`);
      this.destroy();
    }
  }
  getTimeLeft() {
    if (this.solvedTaskCount) {
      return -1;
    }
    let elapsedTime = Date.now() - this.timeStart;
    return elapsedTime * (this.taskTotalCount / this.solvedTaskCount - 1);
  }
  cancel() {
    this.queue.cancelTaskByJob(this.uid);
    this.destroy();
  }
  destroy() {
    this.vueComponent.jobProgresses[this.uid] = undefined;
    this.vueComponent.jobs = this.vueComponent.jobs.filter(
      (j) => j.uid != this.uid
    );
    delete this;
  }
}
