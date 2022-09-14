import AbstractBasicParser from './abstract_basic_parser.js';
import fetchUrl from 'node-fetch';

export default class KonachanParser extends AbstractBasicParser {
  getItemId() {
    if (this.itemId) {
      return this.itemId;
    }
    let parseUrl = this.url.match(/post\/show\/([0-9]+)$/);
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
        `https://konachan.com/post.json?tags=id:${this.getItemId()}&include_tags=1&api_version=2`
      )
    ).text();
    return this.buffer;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      let tags = [];
      const prefix = {
        general: '',
        character: 'character:',
        copyright: 'series:',
        artist: 'creator:',
        meta: 'meta:',
        style: 'style:'
      };
      if (!json.tags) {
        return [];
      }
      for (let tag in json.tags) {
        tags.push(prefix[json.tags[tag]] + tag);
      }
      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}
