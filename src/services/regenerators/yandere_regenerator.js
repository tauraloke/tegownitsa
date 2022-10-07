import AbstractRegenerator from './abstract_regenerator.js';
import fetch from 'node-fetch';
import { applicationUserAgent } from '../utils.js';

export default class YandereRegenerator extends AbstractRegenerator {
  /**
   * @returns {string}
   */
  getMD5() {
    let md5 = this.url.toLowerCase().match(/\/([0-9a-f]{32})/)[1];
    if (!md5) {
      throw { message: 'cannot parse url', url: this.url };
    }
    return md5;
  }
  /**
   * @returns {Promise<string>}
   */
  async regenerateUrl() {
    let response = JSON.parse(
      await (
        await fetch(`https://yande.re/post.json?tags=md5%3A${this.getMD5()}`, {
          headers: { 'User-Agent': applicationUserAgent() },
          method: 'GET'
        })
      ).text()
    );
    console.log(response);
    return `https://yande.re/post/show/${response[0].id}`;
  }
}
