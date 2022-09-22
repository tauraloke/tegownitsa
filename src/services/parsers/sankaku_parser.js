import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class SankakuParser extends BasicJsonMoebooruParser {
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
    try {
      let source = (await this.getJson()).source;
      return source ? [source] : null;
    } catch {
      return null;
    }
  }
  /**
   * @returns {string}
   */
  getFetchUrl() {
    return `https://capi-v2.sankakucomplex.com/posts/${this.getItemId()}`;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      let tags = [];
      const prefixes = {
        0: '',
        5: 'genre:',
        4: 'character:',
        3: 'series:',
        1: 'creator:',
        8: 'meta:'
      };
      if (!json.tags) {
        return [];
      }
      for (let i in json.tags) {
        let tag = json.tags[i];
        let prefix = prefixes[tag.type] || '';
        tags.push(prefix + tag.tagName);
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}
