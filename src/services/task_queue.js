// Frontend class

import sourceTypes from '../config/source_type.json';

export default class TaskQueue {
  constructor(cooldown_bottom, cooldown_top) {
    this.cooldown_bottom = cooldown_bottom * 1000;
    this.cooldown_top = cooldown_top * 1000;
    this.active = false;
    this.timer = null;
    this.tasks = [];
  }
  nextCooldown() {
    return Math.floor(
      this.cooldown_bottom +
        Math.random() * (this.cooldown_top - this.cooldown_bottom)
    );
  }
  start() {
    this.active = true;
    this.runNextTask();
    this.planNextStep();
    return true;
  }
  stop() {
    this.active = false;
    clearTimeout(this.timer);
    this.timer = null;
    return true;
  }
  runNextTask() {
    let _nextTask = this.tasks.shift();
    if (typeof _nextTask === 'function') {
      _nextTask();
    } else {
      this.stop();
    }
  }
  planNextStep() {
    this.timer = setTimeout(() => {
      this.step();
    }, this.nextCooldown());
  }
  step() {
    if (!this.active) {
      return false;
    }
    this.runNextTask();
    this.planNextStep();
    return true;
  }
  addTask(task = () => {}) {
    this.tasks.push(task);
    if (!this.active) {
      this.start();
    }
    return true;
  }
  static addJobTask(jobList, resource_name, locale, url, file) {
    jobList[resource_name].addTask(async () => {
      console.log(
        `Start search tags on ${resource_name} for file #${file['id']}`
      );
      let tags = await window.network.extractTagsFromSource(url, resource_name);
      let source_type = sourceTypes[resource_name.toUpperCase()];
      for (let i in tags) {
        let title = tags[i];
        console.log(`add tag ${title} to file ${file['id']}`);
        await window.sqliteApi.addTag(file['id'], title, locale, source_type);
      }
      await window.sqliteApi.addUrlToFile(url, file['id']);
      console.log(
        `Added tags to file #${file['id']} from ${resource_name}`,
        tags
      );
    });
  }
}
