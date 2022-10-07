import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent, sleep } from '../utils.js';

export default class FurrynetworkRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getAuthor() {
    let author = this.url
      .toLowerCase()
      .match(/cloudfront\.net\/[a-z0-9]{2}\/([a-z0-9]+)\/submission\//)[1];
    if (!author) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return author;
  }
  /**
   * @returns {string}
   */
  getMD5() {
    let md5 = this.url.toLowerCase().match(/\/([0-9a-f]{32})\//)[1];
    if (!md5) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return md5;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let response = { after: [{}] };
    let item = null;
    let offset = 0;
    let limit = 72;
    do {
      console.log(
        'fetch',
        `https://furrynetwork.com/api/search?size=${limit}&from=${offset}&character=${this.getAuthor()}&types%5B%5D=artwork&sort=published`
      ); // TODO: remove
      response = JSON.parse(
        await (
          await fetch(
            `https://furrynetwork.com/api/search?size=${limit}&from=${offset}&character=${this.getAuthor()}&types%5B%5D=artwork&sort=published`,
            {
              headers: { 'User-Agent': applicationUserAgent() },
              method: 'GET'
            }
          )
        ).text()
      );
      item = response.hits.find((i) => i._source.file_name == this.getMD5());
      if (item) {
        break;
      }
      await sleep(1000);
      offset = offset + limit;
    } while (response.after.length > 0);
    if (!item) {
      throw { message: 'Cannot find image', url: this.url };
    }
    return `https://furrynetwork.com/artwork/${item._id}`;
  }
}
