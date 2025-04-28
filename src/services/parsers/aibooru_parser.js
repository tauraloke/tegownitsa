import BasicJsonMoebooruParser from './basic_json_moebooru_parser.js';
// eslint-disable-next-line no-unused-vars
import { ResponseImage } from './parser_response.js';

export default class AibooruParser extends BasicJsonMoebooruParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let trimmed = this.url.split('?')[0];
    let parseUrl = trimmed.match(/post\/show\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = trimmed.match(/posts\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  getFetchUrl() {
    return `https://aibooru.online/posts/${this.getItemId()}.json`;
  }
  async extractTags() {
    try {
      let json = await this.getJson();
      let tags = [];
      const groups = {
        tag_string_general: '',
        tag_string_character: 'character:',
        tag_string_copyright: 'series:',
        tag_string_artist: 'creator:',
        tag_string_meta: 'meta:',
        tag_string_model: 'model:'
      };
      let groupKeys = Object.keys(groups);
      for (let index in groupKeys) {
        let group = groupKeys[index];
        let prefix = groups[group];
        if (json[group]) {
          tags.push(...json[group].split(' ').map((t) => prefix + t));
        }
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
  /**
   * @returns {Promise<string[]?>}
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
   * @returns {Promise<ResponseImage?>}
   */
  async extractFullSizeImage() {
    let json = await this.getJson();
    try {
      return {
        url: json.large_file_url || json.file_url,
        width: json.image_width,
        height: json.image_height
      };
    } catch {
      return null;
    }
  }
  /**
   * @returns {Promise<boolean>}
   */
  async isSafeForWork() {
    let json = await this.getJson();
    const safeRatings = ['g', 's'];
    return safeRatings.includes(json.rating);
  }
}
