// Frontend class

// eslint-disable-next-line no-unused-vars
import BaseTask from './tasks/base_task.js';

export default class TaskQueue {
  constructor(cooldown_bottom, cooldown_top) {
    this.cooldown_bottom = cooldown_bottom * 1000;
    this.cooldown_top = cooldown_top * 1000;
    this.active = false;
    this.timer = null;
    /** @type BaseTask[] */
    this.tasks = [];
  }
  nextCooldown() {
    if (this.skip_timeout) {
      this.skip_timeout = false;
      return 0;
    }
    return Math.floor(
      this.cooldown_bottom +
        Math.random() * (this.cooldown_top - this.cooldown_bottom)
    );
  }
  async start() {
    this.active = true;
    await this.runNextTask();
    this.planNextStep();
    return true;
  }
  stop() {
    this.active = false;
    clearTimeout(this.timer);
    this.timer = null;
    return true;
  }
  async runNextTask() {
    if (this.tasks.length < 1) {
      this.stop();
      return;
    }
    let _nextTask = this.tasks.shift();
    if (_nextTask.run) {
      let result = await _nextTask.run();
      if (result.skip_timeout) {
        this.skip_timeout = true;
      }
    }
  }
  planNextStep() {
    this.timer = setTimeout(() => {
      this.step();
    }, this.nextCooldown());
  }
  async step() {
    if (!this.active) {
      return false;
    }
    await this.runNextTask();
    this.planNextStep();
    return true;
  }
  /**
   * @param {BaseTask} task
   */
  addTask(task) {
    this.tasks.push(task);
    if (!this.active) {
      this.start();
    }
  }
  cancelTaskByJob(jobId) {
    this.tasks = this.tasks.filter((task) => task.job?.id != jobId);
  }
}
