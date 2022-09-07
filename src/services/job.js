// Frontend class

import { randomDigit } from './utils.js';
// eslint-disable-next-line no-unused-vars
import TaskQueue from './task_queue.js';

/**
 * @param {number} digits
 * @returns {string}
 */
function prepareTimeDigits(digits) {
  digits = Math.floor(digits);
  if (digits < 10) {
    return `0${digits}`;
  }
  return digits.toString();
}

export default class Job {
  /**
   * @param {object} arg
   * @param {number} arg.taskTotalCount
   * @param {TaskQueue|null} arg.queue
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
      this.vueComponent?.toast(
        `${this.vueComponent.$t('jobs.done')}: ${this.name}, ${
          this.solvedTaskCount
        }/${this.taskTotalCount}`
      );
      this.destroy();
    }
  }
  getTimeLeft() {
    if (this.solvedTaskCount == 0) {
      return '?';
    }
    let elapsedTime = Date.now() - this.timeStart;
    let timeLeftSec =
      (elapsedTime * (this.taskTotalCount / this.solvedTaskCount - 1)) / 1000;
    let hours = prepareTimeDigits(timeLeftSec / 3600);
    let munutes = prepareTimeDigits((timeLeftSec % 3600) / 60);
    let seconds = prepareTimeDigits(timeLeftSec % 60);
    return `${hours}:${munutes}:${seconds}`;
  }
  cancel() {
    this.queue?.cancelTaskByJob(this.uid);
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
