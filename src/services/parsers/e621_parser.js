import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';
import config from '../../config/store.js';
import { applicationUserAgent } from '../utils.js';

export default class E621Parser extends BasicJsonMoebooruParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/post\/show\/([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = this.url.match(/posts\/([0-9]+)/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://e621.net/posts/${this.getItemId()}.json`;
  }
  getUserAgent() {
    const username = config.get('e621_username');
    if (!username) {
      throw 'We do not recomment to request this source without a username in user-agent, see https://e621.net/help/api';
    }
    return `${applicationUserAgent()} / e621 username: ${username}`;
  }
  async extractTags() {
    try {
      let json = (await this.getJson()).post.tags;
      let tags = [];
      const groups = {
        general: '',
        species: 'specie:',
        character: 'character:',
        copyright: 'series:',
        artist: 'creator:',
        meta: 'meta:'
      };
      let groupKeys = Object.keys(groups);
      for (let index in groupKeys) {
        let group = groupKeys[index];
        let prefix = groups[group];
        if (json[group]) {
          tags.push(...json[group].map((t) => prefix + t));
        }
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
  /**
   * @returns {Promize<string[]?>}
   */
  async extractSourceUrls() {
    try {
      return (await this.getJson()).post.sources;
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let file = (await this.getJson()).post.file;
    try {
      return {
        url: file.url,
        width: file.width,
        height: file.height
      };
    } catch {
      return null;
    }
  }
}
