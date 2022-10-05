import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';
import DeviantArt from 'deviantart.ts';
import config from '../../config/store.js';
import { sleep } from '../utils.js';

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
  getUsername() {
    return this.metadata.author.toLowerCase();
  }
  async getJson() {
    return await this.getBuffer();
  }
  async getBuffer() {
    if (this._buffer) {
      return this._buffer;
    }
    const client_id = config.get('deviantart_client_id');
    const client_token = config.get('deviantart_client_token');
    let deviantArt = await DeviantArt.login(client_id, client_token);
    let username = this.getUsername();
    let item_id = this.getItemId();
    let all = { has_more: 1 };
    let deviation_id = null;
    let offset = 0;
    let limit = 24;
    do {
      all = await deviantArt.gallery.all({
        username: username,
        limit: limit,
        offset: offset
      });
      let item = all.results.find((i) => i.url.match('-' + item_id));
      if (item) {
        deviation_id = item.deviationid;
      }
      offset = offset + limit;
      await sleep(2000);
    } while (!all.has_more);
    if (!deviation_id) {
      throw {
        message: 'Cannot find an image in the gallery',
        username: username,
        url: this.url
      };
    }
    this._buffer = await deviantArt.deviation.metaData({
      deviationids: [deviation_id],
      mature_content: true
    });
    return this._buffer;
  }
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = json.metadata[0].tags.map((t) => t.tag_name).filter((t) => t);
      if (this.getUsername()) {
        tags.push(`creator:${this.getUsername()}`);
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
      return json.metadata[0].title;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    try {
      return [`https://www.deviantart.com/${this.getUsername()}`];
    } catch {
      return null;
    }
  }
}
