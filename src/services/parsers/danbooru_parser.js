import AbstractBasicParser from './abstract_basic_parser.js';
import fetchUrl from 'node-fetch';

export default class DanbooruParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/post\/show\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    parseUrl = this.url.match(/posts\/([0-9]+)$/);
    if (parseUrl && parseUrl[1]) {
      this.itemId = parseUrl[1];
      return this.itemId;
    }
    throw `Cannot parse url ${this.url}`;
  }
  async getBuffer() {
    if (this.buffer) {
      return this.buffer;
    }
    this.buffer = await (
      await fetchUrl(
        `https://danbooru.donmai.us/posts/${this.getItemId()}.json`
      )
    ).text();
    return this.buffer;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      let tags = [];
      const groups = {
        tag_string_general: '',
        tag_string_character: 'character:',
        tag_string_copyright: 'series:',
        tag_string_artist: 'creator:',
        tag_string_meta: 'meta:'
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
}
