import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class BasicJsonMoebooruParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/post\/show\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    return null;
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    try {
      let source = (await this.getJson()).posts[0].source;
      return source ? [source] : null;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let json = await this.getJson();
    try {
      return {
        url: json.posts[0].file_url || json.posts[0].jpeg_url,
        width: json.posts[0].jpeg_width,
        height: json.posts[0].jpeg_height
      };
    } catch {
      return null;
    }
  }
  /**
   * @abstract
   * @returns {string}
   */
  getFetchUrl() {
    throw 'Abstract method!';
  }
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = [];
      const prefix = {
        general: '',
        character: 'character:',
        copyright: 'series:',
        artist: 'creator:',
        meta: 'meta:',
        style: 'style:'
      };
      if (!json.tags) {
        return [];
      }
      for (let tag in json.tags) {
        tags.push(prefix[json.tags[tag]] + tag);
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}
