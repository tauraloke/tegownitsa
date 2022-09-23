// frontend class

import BaseTask from './base_task.js';
import sourceTypes from '../../config/source_type.json';
// eslint-disable-next-line no-unused-vars
import ParserResponse from '../../services/parsers/parser_response.js';

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
    /** @type {ParserResponse} */
    let data = await window.network.extractDataFromSource(
      this.url,
      this.resource_name
    );
    await this._processTags(data);
    await this._processAuthorUrls(data);
    await this._processSources(data, this.file['id']);

    this.incrementJobProgress(1);
  }
  async _processSources(data, file_id) {
    if (data.sourceUrls) {
      for (let i in data.sourceUrls) {
        await window.sqliteApi.addUrlToFile(
          { url: data.sourceUrls[i] },
          file_id
        );
      }
    }
    await window.sqliteApi.addUrlToFile(
      { url: data.requestedUrl, title: data.title },
      file_id
    );
  }
  async _processTags(data) {
    let tags = data.tags;
    let source_type = sourceTypes[this.resource_name.toUpperCase()];
    for (let i in tags) {
      let title = tags[i];
      console.log(`add tag ${title} to file ${this.file['id']}`);
      await window.sqliteApi.addTag(
        this.file['id'],
        title,
        this.locale,
        source_type
      );
    }
    console.log(
      `Added tags to file #${this.file['id']} from ${this.resource_name}`,
      data.tags
    );
  }
  /**
   * @param {ParserResponse} data
   */
  async _processAuthorUrls(data) {
    let authorTags = data.tags.filter((t) => t.match(/^creator:/));
    if (data?.authorUrls?.length > 0 && authorTags.length == 1) {
      for (let i in data.authorUrls) {
        let authorUrl = data.authorUrls[i];
        await window.sqlite.addAuthorUrl(
          { title: authorTags[0], locale: this.locale },
          authorUrl
        );
      }
    }
  }
}
