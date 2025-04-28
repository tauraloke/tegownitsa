import AbstractBasicParser from './abstract_basic_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class CivitaiParser extends AbstractBasicParser {
  /**
   * @returns {string}
   */
  getItemID() {
    const data = this.url.toLowerCase().match(/\?input=(.*?)$/)?.[1];
    const id = JSON.parse(decodeURIComponent(data))?.json?.id;
    if (!id) {
      throw { message: 'cannot parse url for civitai', url: this.url };
    }
    return id;
  }
  getFetchUrl() {
    const data = {
      json: { id: parseInt(this.getItemID()), type: 'image', authed: true }
    };
    return `https://civitai.com/api/trpc/tag.getVotableTags?input=${encodeURI(
      JSON.stringify(data)
    )}`;
  }
  async extractTags() {
    try {
      /** @type {{result:{data:{json:[{name: String}]}}}} */
      const json = await this.getJson();
      const tags = json.result.data.json.map((t) => t.name);
      return tags;
    } catch (error) {
      console.log('tags: cannot parse for url', this.url, error);
      return [];
    }
  }
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    return this.url;
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
    return null;
  }
  /**
   * @returns {Promise<string[]?>}
   */
  async extractAuthorUrls() {
    return null;
  }
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    try {
      /** @type {{result:{data:{json:[{nsfwLevel: Number}]}}}} */
      const json = await this.getJson();
      return !json.result.data.json.some((t) => t.nsfwLevel > 1);
    } catch (error) {
      console.log('nsfw: cannot parse json for', this.url, error);
      return [];
    }
  }
}
