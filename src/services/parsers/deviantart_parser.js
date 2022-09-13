import AbstractBasicParser from './abstract_basic_parser.js';
import fetchUrl from 'node-fetch';

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
  async getBuffer() {
    if (this.buffer) {
      return this.buffer;
    }
    this.buffer = await (
      await fetchUrl(
        `https://www.deviantart.com/_napi/da-deviation/shared_api/deviation/extended_fetch?deviationid=${this.getItemId()}&type=art&include_session=false`
      )
    ).text();
    return this.buffer;
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
}
