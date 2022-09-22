import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class PixivParser extends AbstractBasicParser {
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let json = await this.getJson();
    try {
      return {
        url: json.body.urls.original,
        width: json.body.width,
        height: json.body.height
      };
    } catch {
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
    let json = await this.getJson();
    try {
      return json.body.title || json.body.illustTitle;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    try {
      let userId = (await this.getJson()).body.userId;
      return userId ? [`https://www.pixiv.net/en/users/${userId}`] : null;
    } catch {
      return null;
    }
  }
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/\/artworks\/([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = this.url.match(/illust_id=([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://www.pixiv.net/ajax/illust/${this.getItemId()}?lang=en`;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      let tags = json.body.tags.tags
        .map((t) => {
          if (t.translation && t.translation.en) {
            return t.translation.en;
          }
          if (t.romaji) {
            return t.romaji;
          }
          return t.tag;
        })
        .filter((t) => t);
      if (json.body.userAccount) {
        tags.push(`creator:${json.body.userAccount}`);
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}
