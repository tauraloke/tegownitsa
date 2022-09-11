import AbstractBasicParser from './abstract_basic_parser.js';
import fetchUrl from 'node-fetch';

class PixivParser extends AbstractBasicParser {
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
  async getBuffer() {
    if (this.buffer) {
      return this.buffer;
    }
    this.buffer = await (
      await fetchUrl(
        `https://www.pixiv.net/ajax/illust/${this.getItemId()}?lang=en`
      )
    ).text();
    return this.buffer;
  }
  async extractTags() {
    try {
      let json = JSON.parse(await this.getBuffer());
      console.log('pixiv_parser.js', json.body.tags.tags); // TODO: remove
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
      console.log('pixiv_parser.js - 2', tags); // TODO: remove

      return tags;
    } catch (error) {
      console.log('Cannot parse url', this.url, error);
      return [];
    }
  }
}

export default PixivParser;
