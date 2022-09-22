import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class DeviantartParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/-([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = this.url.match(/\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://www.deviantart.com/_napi/da-deviation/shared_api/deviation/extended_fetch?deviationid=${this.getItemId()}&type=art&include_session=false`;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      let tags = json.deviation.extended.tags
        .map((t) => t.name)
        .filter((t) => t);
      if (json.deviation.author.username) {
        tags.push(`creator:${json.deviation.author.username}`);
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
    return null;
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
      return json.deviation.title;
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
      let username = json.deviation.author.username;
      return username ? [`https://www.deviantart.com/${username}`] : null;
    } catch {
      return null;
    }
  }
}
