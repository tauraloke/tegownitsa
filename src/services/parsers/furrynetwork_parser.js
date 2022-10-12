import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class FurrynetworkParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/artwork\/([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = this.url.match(/viewId=([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://furrynetwork.com/api/artwork/${this.getItemId()}`;
  }
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = [...json.tags.map((t) => t.value)];
      if (json.character && json.character.name) {
        tags.push(`creator:${json.character.name}`);
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
      return {
        url: json.images.large,
        width: null,
        height: null
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
      return [`https://furrynetwork.com/${json.character.name}/`];
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    let json = await this.getJson();
    const safeRatings = [0];
    return safeRatings.includes(json.rating);
  }
}
