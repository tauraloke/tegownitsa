import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent } from '../utils.js';
import { load } from 'cheerio';

export default class KonachanRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getMD5() {
    let md5 = this.url.toLowerCase().match(/([0-9a-f]{32})\./)[1];
    if (!md5) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return md5;
  }
  /**
   * @returns {CheerioAPI}
   */
  async getHtmlParser() {
    this._htmlParser = this._htmlParser || load(await this.getBuffer());
    return this._htmlParser;
  }
  /**
   * @returns {string}
   */
  async getBuffer() {
    this._buffer =
      this._buffer ||
      (await (
        await fetch(
          `https://gelbooru.com/index.php?page=post&s=list&tags=md5%3A${this.getMD5()}`,
          {
            headers: { 'User-Agent': applicationUserAgent() },
            method: 'GET'
          }
        )
      ).text());
    return this._buffer;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let $ = await this.getHtmlParser();
    let id = $(
      $('#container > main > div.thumbnail-container > article > a')[0]
    )
      .attr('id')
      .match(/p([0-9]+)/)[1];
    return `https://gelbooru.com/index.php?page=post&s=view&id=${id}`;
  }
}
