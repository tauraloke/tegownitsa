// frontend class

import BaseTask from './base_task.js';
import sourceTypes from '../../config/source_type.json';

export default class ParseTagResourceTask extends BaseTask {
  /**
   * @param {object} options
   * @param {string} options.resource_name
   * @param {object} options.file
   * @param {string} options.locale
   * @param {string} options.url
   * @param {Job} options.job
   */
  // eslint-disable-next-line no-unused-vars
  constructor({ resource_name, file, locale, url, job }) {
    super();
    this.resource_name = resource_name;
    this.file = file;
    this.locale = locale;
    this.url = url;
  }
  async run() {
    console.log(
      `Start search tags on ${this.resource_name} for file #${this.file['id']}`
    );
    let tags = await window.network.extractTagsFromSource(
      this.url,
      this.resource_name
    );
    let source_type = sourceTypes[this.resource_name.toUpperCase()];
    for (let i in tags) {
      let title = tags[i];
      console.log(`add tag ${title} to file ${this.file['id']}`);
      await window.sqliteApi.addTag(
        this.file['id'],
        this.title,
        this.locale,
        source_type
      );
    }
    await window.sqliteApi.addUrlToFile(this.url, this.file['id']);
    console.log(
      `Added tags to file #${this.file['id']} from ${this.resource_name}`,
      tags
    );
    this.incrementJobProgress(1);
  }
}
