import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class ArtstationParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/([0-9A-Za-z]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://www.artstation.com/projects/${this.getItemId()}.json`;
  }
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = [...json.tags];
      if (json.user && json.user.username) {
        tags.push(`creator:${json.user.username}`);
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    try {
      let json = await this.getJson();
      let image = json.assets[0];
      return {
        url: image.image_url,
        width: image.width,
        height: image.height
      };
    } catch (error) {
      return null;
    }
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    return null;
  }
  /**
   * @returns {Promise<string?>}
   */
  async extractTitle() {
    try {
      let json = await this.getJson();
      return json.title;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    try {
      let json = await this.getJson();
      return [json.user.permalink];
    } catch {
      return null;
    }
  }
}
