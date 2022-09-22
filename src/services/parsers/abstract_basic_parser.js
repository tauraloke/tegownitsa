import fetchUrl from 'node-fetch';
import { load } from 'cheerio';
// eslint-disable-next-line no-unused-vars
import ParserResponse, { ResponseImage } from './parser_response.js';

export default class AbstractBasicParser {
  /**
   * @param {string} url
   */
  constructor(url) {
    if (url.match('^//')) {
      url = `https:${url}`;
    }
    this.url = url;
  }
  /**
   * @returns {Promise<ParserResponse>}
   */
  async parse() {
    return new ParserResponse({
      requestedUrl: this.url,
      tags: await this.extractTags(),
      fullSizeImage: await this.extractFullSizeImage(),
      title: await this.extractTitle(),
      sourceURLs: await this.extractSourceUrls(),
      authorUrls: await this.extractAuthorUrls()
    });
  }
  /**
   * @abstract
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    throw {
      error: 'Direct call of an abstract method extractFullSizeImage()'
    };
  }
  /**
   * @abstract
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    throw { error: 'Direct call of an abstract method extractTitle()' };
  }
  /**
   * @abstract
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    throw { error: 'Direct call of an abstract method extractSourceURLs()' };
  }
  /**
   * @abstract
   * @returns {Promize<string[]?>}
   */
  async extractAuthorUrls() {
    throw { error: 'Direct call of an abstract method extractAuthorUrls()' };
  }
  /**
   * @returns {string}
   */
  getFetchUrl() {
    return this.url;
  }
  async getBuffer() {
    this._buffer =
      this._buffer || (await (await fetchUrl(this.getFetchUrl())).text());
    return this._buffer;
  }
  /**
   * @abstract
   * @returns {Object<string, string>}
   */
  getTagGroups() {
    throw { error: 'Direct call of an abstract method getTagGroups()' };
  }
  /**
   * @returns {CheerioAPI}
   */
  async getHtmlParser() {
    this._htmlParser = this._htmlParser || load(await this.getBuffer());
    return this._htmlParser;
  }
  /**
   * @returns {Promise<object[]>}
   */
  async extractTags() {
    if (this._tags && this._tags.length > 0) {
      return this._tags;
    }
    this._tags = [];
    for (let name in this.getTagGroups()) {
      let prefix = this.getTagGroups()[name];
      this._tags.push(...(await this.tagGroupsExtractor(name, prefix)));
    }
    return this._tags;
  }
  // @Abstract
  async tagGroupsExtractor(_groupName, _prefix) {
    throw { error: 'Direct call of an interface method tagGroupsExtractor()' };
  }
  // @Abstract
  getClassTemplate() {
    throw { error: 'Direct call of an interface method getClassTemplate()' };
  }
  async getJson() {
    this._json = this._json || JSON.parse(await this.getBuffer());
    return this._json;
  }
}
