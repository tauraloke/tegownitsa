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
   * @param {ParserResponse?} options.noRemoteItem replace source request if not null
   * @param {object} options.metadata
   * @param {()=>{}} options.onAfterDataAdded
   */
  constructor({
    resource_name,
    file,
    locale,
    url,
    // eslint-disable-next-line no-unused-vars
    job,
    noRemoteItem,
    metadata,
    onAfterDataAdded
  }) {
    super();
    this.resource_name = resource_name;
    this.file = file;
    this.locale = locale;
    this.url = url;
    this.noRemoteItem = noRemoteItem;
    this.metadata = metadata;
    this.onAfterDataAdded = onAfterDataAdded;
  }
  /**
   * @returns {Promise<{skip_timeout: boolean?;status: string}}
   */
  async run() {
    try {
      if (
        await window.sqliteApi.isFileAlreadyPolled(
          this.file.id,
          sourceTypes[this.resource_name.toUpperCase()]
        )
      ) {
        console.log(
          `Resource ${this.resource_name} is already polled for the file #${this.file['id']}`
        );
        this.incrementJobProgress(1);
        return { skip_timeout: true, status: 'OK' };
      }
      console.log(
        `Start searching data on ${this.resource_name} for the file #${this.file['id']}`
      );
      let data = await this.extractData();
      console.log('extracted data', data);
      await this._processTags(data);
      await this._processAuthorUrls(data);
      await this._processSources(data, this.file['id']);
      if (data.fullSizeImage) {
        await window.sqliteApi.addFileFullsize(
          this.file['id'],
          data.fullSizeImage
        );
      }
      if (!data.isSafeForWork) {
        await window.sqliteApi.updateFileIsSafeField(this.file['id'], false);
      }
      if (this.onAfterDataAdded) {
        this.onAfterDataAdded();
      }
      this.incrementJobProgress(1);
      return { status: 'OK' };
    } catch (e) {
      console.log('Failed', e);
      return { status: 'FAIL' };
    }
  }
  /**
   * @returns {ParserResponse}
   */
  async extractData() {
    if (this.noRemoteItem) {
      return this.noRemoteItem;
    }
    let data = await window.network.extractDataFromSource(
      this.url,
      this.resource_name,
      { preview_path: this.file.preview_path, id: this.file.id },
      { author: this.metadata ? this.metadata.author : null }
    );
    return data;
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
        await window.sqliteApi.addAuthorUrl(
          { title: authorTags[0].split(':')[1], locale: this.locale },
          authorUrl
        );
      }
    }
  }
}
