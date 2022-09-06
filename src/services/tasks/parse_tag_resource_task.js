// frontend class

import BaseTask from './base_task.js';
import sourceTypes from '../../config/source_type.json';

export default class ParseTagResourceTask extends BaseTask {
  async run() {
    let resource_name = this.options.resource_name;
    let file = this.options.file;
    let locale = this.options.locale;
    let url = this.options.url;

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
    this.incrementJobProgress(1);
  }
}
