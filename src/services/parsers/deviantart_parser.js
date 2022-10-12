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
    let match = this.url.match(/deviantart\.com\/([^/]+)\/art/);
    if (match) {
      return match[1];
    }
    return this.metadata.author.toLowerCase();
  }
  async getMetadata() {
    return await this.getBuffer();
  }
  /**
   * @returns {Promise<DeviantArt>}
   */
  async getDaClient() {
    if (this._da_client) {
      return this._da_client;
    }
    const client_id = config.get('deviantart_client_id');
    const client_token = config.get('deviantart_client_token');
    this._da_client = await DeviantArt.login(client_id, client_token);
    return this._da_client;
  }
  async getDeviantionId() {
    if (this._deviation_id) {
      return this._deviation_id;
    }
    let username = this.getUsername();
    let item_id = this.getItemId();
    let all = { has_more: 1 };
    let deviation_id = null;
    let offset = 0;
    let limit = 24;
    do {
      all = await (
        await this.getDaClient()
      ).gallery.all({
        username: username,
        limit: limit,
        offset: offset,
        mature_content: true
      });
      let item = all.results.find((i) => i.url.match('-' + item_id));
      if (item) {
        deviation_id = item.deviationid;
        break;
      }
      offset = offset + limit;
      await sleep(2000);
    } while (!all.has_more);
    if (!deviation_id) {
      throw {
        message: 'Cannot find an image in the gallery',
        username,
        url: this.url,
        item_id
      };
    }
    this._deviation_id = deviation_id;
    return this._deviation_id;
  }
  async getBuffer() {
    if (this._buffer) {
      return this._buffer;
    }
    let deviation_id = await this.getDeviantionId();
    this._buffer = await (
      await this.getDaClient()
    ).deviation.metaData({
      deviationids: [deviation_id],
      mature_content: true
    });
    return this._buffer;
  }
  async extractTags() {
    try {
      let json = await this.getMetadata();
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
  async fetchImageData() {
    return (await this.getDaClient()).deviation.get({
      deviationid: await this.getDeviantionId()
    });
  }
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let data = await this.fetchImageData();
    return {
      url: data.content.src,
      width: data.content.width,
      height: data.content.height
    };
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
      let json = await this.getMetadata();
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
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    let json = await this.getMetadata();
    return !json.metadata.isMature;
  }
}
